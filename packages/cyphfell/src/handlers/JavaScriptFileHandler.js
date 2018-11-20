const AbstractFileHandler = require("./AbstractFileHandler"),
	esprima = require("../util/EsprimaUtils"),
	estraverse = require("estraverse"),
	regexUtil = require("../util/RegexUtil"),
	converter = require("../converters/ActiveConverter"),
	fs = require("fs"),
	assert = require("assert"),
	relative = require("relative"),
	postParseRegex = require("../regex/PostParseRegex"),
	replaceTemporaryRegex = require("../regex/ReplaceTemporaryRegex"),
	dirUtil = require("../util/DirectoryUtils"),
	pluginsUtil = require("../util/PluginsUtil"),
	filePathUtil = require("../util/FilePathUtil"),
	transformReturnFunctions = require("../util/FunctionBodyTransformer").transformReturnFunctions,
	report = require("../reports/ReportGenerator"),
	replacements = converter.getStrategy().getReplacementRegex();

const transformBrowserExecutes = (str) => {
	const regex = new RegExp(regexUtil.formatRegex("browser.execute("), "g");
	let result;
	do {
		result = regex.exec(str);
		if (result) {
			const call = regexUtil.traverseBracketStack(result, str);
			if (str.includes(`${call}.value`)) {
				str = str.replace(`${call}.value`, call);
			}
		}
	} while (result);
	return str;
};

class JavaScriptFileHandler extends AbstractFileHandler {

	/**
     * Gets whether this handler can convert the specified file
     * @param {String} dir - the path to the file
     * @return {boolean}
     */
	canHandle(dir) {
		return dir.endsWith(".js");
	}

	/**
     * Transforms a line from WDIO format to Cypress format
     * @param {String} line - the original line
     * @return {String} - the equivalent line in Cypress format
     */
	transformLine(line) {
		replacements.forEach((replacement) => {
			const expressions = [{
				regex: replacement.from,
				replacement: replacement.to
			}];
			if (replacement.browserOnly !== true && replacement.from.includes("browser") && !replacement.assertion) {
				// account for browser.element(...). by replacing the first RegEx parameter if existing, and removing browser
				let newRegex = replacement.from.replace("browser", "").replace(/param,{0,1}/, "");
				if (newRegex.endsWith("(")) {
					newRegex += ")";
				}
				expressions.push({
					regex: newRegex,
					replacement: replacement.to ? replacement.to.replace("cy.get(${param1})", "") : null
				});
			}
			expressions.forEach((expression, i) => {
				const regex = new RegExp(regexUtil.formatRegex(expression.regex), "g");
				if (replacement.errorCondition) {
					const condition = regexUtil.getErrorConditionValue(line, replacement.errorCondition, regex, i);
					try {
						if (eval(condition)) {
							report.onTransformationError(replacement.errorMessage, line);
							return;
						}
					} catch (ex) {
					}
				}
				if (expression.replacement) {
					while (true) {
						const newLine = regexUtil.replaceAll(line, regex, expression.replacement, i);
						if (newLine !== line) {
							line = newLine;
						} else {
							break;
						}
					}
				}
			});
		});
		return line;
	}

	transformNode(node) {
		if (node.arguments && node.arguments[1] && (node.arguments[1].type === "ArrowFunctionExpression" || node.arguments[1].type === "FunctionExpression")) {
			return;
		}
		const str = this.transformLine(esprima.generateCodeFromAST(node));
		esprima.overwriteNode(node, esprima.generateAST(str).body[0].expression);
		node.transformed = true;
	}

	transformImports(ast) {
		const findNewPath = (node, originalImport) => {
			const absoluteImportPath = filePathUtil.findAbsolutePathToImport(this.fileDir, originalImport);
			// if this import is not from a node module, and is instead from the plugin's local files instead
			if (!absoluteImportPath.includes("node_modules")) {
				// make sure that the old import path exists
				if (options.enableAssertions) {
					assert.strictEqual(fs.existsSync(absoluteImportPath), true, `Could not find old import path: ${absoluteImportPath} for ${esprima.generateCodeFromAST(node)} \n in ${this.fileDir}`);
				}
				let importContents = "";
				try {
					importContents = fs.readFileSync(absoluteImportPath, "utf8");
				} catch (ex) {
					//console.log(ex);
				}
				const newImportAbsPath = dirUtil.getNewFilePath(absoluteImportPath, importContents, options);
				let newRelativePath = relative(this.newFileDir, newImportAbsPath);
				if (!newRelativePath.startsWith(".")) {
					newRelativePath = `./${newRelativePath}`;
				}

				return newRelativePath;
			} else {
				const newImport = options.transformModuleImportIntoCypress(originalImport);
				if (newImport !== originalImport) {
					return newImport;
				}
			}
		};
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "ImportDeclaration") {
					if (node.source && node.source.type === "Literal") {
						const newImport = findNewPath(node, node.source.value);
						if (newImport) {
							node.source.value = newImport;
							node.source.raw = `"${newImport}"`;
						}
					}
				} else if (esprima.isRequireStatement(node)) {
					const newImport = findNewPath(node, node.arguments[0].value);
					if (newImport) {
						node.arguments[0].value = newImport;
						node.arguments[0].raw = `"${newImport}"`;
					}
				}
			}
		});
	}

	parseImpl(plugins) {
		let ast = esprima.generateAST(this.lines);
		this.transformImports(ast);
		pluginsUtil.invokePlugins(plugins, ast, "beforeParseLines", this.newFileDir);

		estraverse.traverse(ast, {
			enter: (node, parent) => {
				node.parent = parent;
				if ((node.type === "CallExpression" || node.type === "MemberExpression") && !node.parent.transformed) {
					this.transformNode(node);
				}
			}
		});

		pluginsUtil.invokePlugins(plugins, ast, "afterParseLines", this.newFileDir);
		pluginsUtil.invokePlugins(plugins, ast, "beforeTransformAfterParsing", this.newFileDir);

		this.lines = esprima.fixInconsistentSpacing(esprima.generateCodeFromAST(ast));
		this.lines = transformBrowserExecutes(this.lines);
		this.lines = transformReturnFunctions(this.lines, this.newFileDir);
		this.lines = postParseRegex(this.lines);

		ast = esprima.generateAST(this.lines);
		pluginsUtil.invokePlugins(plugins, ast, "afterTransformAfterParsing", this.newFileDir);

		this.lines = esprima.fixInconsistentSpacing(replaceTemporaryRegex(esprima.generateCodeFromAST(ast)));
		ast = esprima.generateAST(this.lines, true);
		pluginsUtil.invokePlugins(plugins, ast, "afterComplete", this.newFileDir);
		return this.lines;
	}
}

module.exports = JavaScriptFileHandler;