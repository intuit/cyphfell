const BaseWarning = require("../BaseWarningPlugin");
const estraverse = require("estraverse");
const FunctionBodyTransformer = require("../util/FunctionBodyTransformer");
const esprima = require("../util/EsprimaUtils");

/**
 * Detects when the user has loops with Cypress commands inside of them
 */
class LoopWarningsPlugin extends BaseWarning {

	/**
	 * Walks the given AST and adds any warnings to the output report
	 * @param {Object} ast - the AST to walk
	 * @param {String} newFileDir - the new directory of the file
	 */
	run(ast, newFileDir) {
		estraverse.traverse(ast, {
			enter: (node) => {
				if ((node.type === "ForStatement" || node.type === "WhileStatement" || node.type === "DoWhileStatement") &&
					FunctionBodyTransformer.isPromiseChain("", newFileDir)(esprima.generateCodeFromAST(node))) {
					this.reportWarning(node);
				}
			}
		});
	}

	/**
	 * Gets the unique name of this warning
	 * @return {String} - the unique name of this warning
	 */
	getName() {
		return "LoopWarning";
	}

	getMessage() {
		return "You have Cypress commands inside of a loop here. This may need to be done in a different way to be compatible with Cypress.";
	}
}

module.exports = LoopWarningsPlugin;