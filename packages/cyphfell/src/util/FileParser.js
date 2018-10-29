const esprima = require("./EsprimaUtils"),
	estraverse = require("estraverse"),
	handlers = require("../handlers/FileHanderList"),
	report = require("../reports/ReportGenerator");

const separateVariableDeclarations = (str) => {
	const ast = esprima.generateAST(str);
	const combinable = [];
	estraverse.traverse(ast, {
		enter: (node, parent) => {
			if (node.type === "VariableDeclaration" && node.declarations.length > 1) {
				combinable.push({declarations: [], original: node, kind: node.kind});
			} else if (node.type === "VariableDeclarator" && parent.declarations.length > 1) {
				combinable[combinable.length - 1].declarations.push(node);
			}
		}
	});
	combinable.forEach((declGroup) => {
		const replacement = declGroup.declarations.reduce((prev, decl) => {
			return `${prev}\n${declGroup.kind} ${esprima.generateCodeFromAST(decl)};`;
		}, "");
		str = str.replace(esprima.generateCodeFromAST(declGroup.original), replacement);
	});
	return str;
};

/**
 * Parses a test file and converts it into Cypress format if necessary
 * @param {String} lines - all of the lines in the file
 * @param {String} fileDir - the path to the file
 * @param {Object} options - the configuration options passed in
 * @param {Array<BasePlugin>} plugins - all plugins that will modify the AST
 * @return {String} - the lines in the file, after modifications are made
 */
module.exports = (lines, fileDir, options, plugins) => {
	try {
		if (!fileDir.includes(".json")) {
			lines = esprima.fixInconsistentSpacing(lines);
			lines = separateVariableDeclarations(lines);
		}
		for (const handler of handlers) {
			const res = handler.handleParseAttempt(lines, fileDir, plugins);
			if (res) {
				//return res.replace(/;\s*?;/g, ";");
				return res.replace(/\s+;\s/g, "");
			} else if (lines === "" && handler.canHandle(fileDir)) {
				return "";
			}
		}
		throw new Error("No handler found");
	} catch (ex) {
		console.error("Could not parse: " + fileDir);
		console.error(ex);
		report.onCriticalError(ex.stack);
		return lines;
	}
};