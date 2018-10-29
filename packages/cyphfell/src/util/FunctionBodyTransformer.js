const regexUtil = require("../util/RegexUtil"),
	converter = require("../converters/ActiveConverter"),
	esprima = require("../util/EsprimaUtils");

let replacements,
	reverseRegex;

class FunctionBodyTransformer {

	static isPromiseChain(str, newFileDir) {
		if (!replacements) {
			replacements = converter.getStrategy().getReplacementRegex();
			reverseRegex = converter.getStrategy().getReplacedReturnRegex();
		}

		/**
         * Maps a file's absolute path --> (function name --> method body)
         * @type {Map<String, Map<String, String>>}
         */
		const allImports = new Map();
		/*const visitedFiles = new Map();
		const getRegexes = [
			new RegExp(regexUtil.formatRegex(" = cy.get(captureAll);"), "g"),
			new RegExp(regexUtil.formatRegex(" = cy.get(captureAll)(?:.find(captureAll));"), "g"),
			new RegExp(regexUtil.formatRegex("cy.get(captureAll).then("), "g"),
			new RegExp(regexUtil.formatRegex("cy.get(captureAll)(?:.find(captureAll).then(;"), "g"),
			new RegExp(regexUtil.formatRegex("return cy.get(captureAll);"), "g"),
			new RegExp(regexUtil.formatRegex("return cy.get(captureAll)(?:.find(captureAll));"), "g"),
		];*/

		const filter = (code, className = null, funcName = null, variables = new Map()) => {
			if (!className) {
				className = "this";
			}

			/*if (visitedFiles.has(JSON.stringify({className: className, funcName: funcName}))) {
                return visitedFiles.get(JSON.stringify({className: className, funcName: funcName}));
            }*/
			let importSource = className === "this" ? esprima.getFunctionSource(str, funcName) :
				esprima.getImportSourceCode(str, className, funcName, newFileDir, allImports);

			//console.log(className + " // " + funcName + " // " + importSource);
			if (!importSource) {
				importSource = esprima.getImportSourceCode(str, variables.get(className), funcName, newFileDir, allImports);
			}
			const wdioRegexes = [];
			replacements.filter((replacement) => replacement.returnValue).forEach((replacement) => {
				wdioRegexes.push(new RegExp(regexUtil.formatRegex(replacement.from), "g"));
				if (!replacement.browserOnly && replacement.from.includes("browser")) {
					let newRegex = replacement.from.replace("browser", "").replace(/param,{0,1}/, "");
					if (newRegex.endsWith("(")) {
						newRegex += ")";
					}
					wdioRegexes.push(new RegExp(regexUtil.formatRegex(newRegex), "g"));
				}
			});
			let found = reverseRegex.some((replacement) => {
				const regex = new RegExp(regexUtil.formatRegex(replacement), "g");
				if (regex.exec(code)) {
					return true;
				}
			});

			if (!found && importSource) {
				/*if (importSource.split("\n").some((line) => getRegexes.some((regex) => line.match(regex)))) {
                    found = true;
                } else {*/
				// TODO: recursion in a way that avoids circular dependencies (maybe generate AST of importSource and walk through that?)
				found = (wdioRegexes.some((regex2) => {
					return regex2.exec(importSource);
				})) || (
					reverseRegex.some((replacement) => {
						const regex = new RegExp(regexUtil.formatRegex(replacement), "g");
						if (regex.exec(importSource)) {
							return true;
						}
					})
				//filter(importSource, "this", funcName, variables)
				);
				//}
				if (!found && importSource.match(new RegExp(regexUtil.formatRegex("return cy.get(rest);"), "g"))) {
					found = true;
				}
			}
			//visitedFiles.set(JSON.stringify({className: className, funcName: funcName}), found);
			return found;
		};
		return filter;
	}

	/**
     * Transforms all synchronous return value functions to their async Cypress counterparts
     * @param {String} str - the lines in the file
     * @param {String} newFileDir - the new directory to write the file being converted to
     * @return {String} the lines in the file after transformation
     */
	static transformReturnFunctions(str, newFileDir) {
		return esprima.modifyReturnFunctions(str, FunctionBodyTransformer.isPromiseChain(str, newFileDir));
	}
}

module.exports = FunctionBodyTransformer;