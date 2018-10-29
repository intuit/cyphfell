const BasePlugin = require("./BasePlugin");
const report = require("./reports/ReportGenerator");
const esprima = require("./util/EsprimaUtils");

/**
 * Represents a base class that any warning implementation must override. Warnings scan the converted Cypress code
 * and highlight lines where the user may have to take certain actions
 */
class BaseWarningPlugin extends BasePlugin {

	/**
	 * Walks the given AST and adds any warnings to the output report
	 * @param {Object} ast - the AST to walk
	 * @param {String} newFileDir - the new directory of the file
	 */
	run(ast, newFileDir) {
	}

	/**
	 * Gets the warning message to write to the report
	 * @return {String}
	 */
	getMessage() {
		return "";
	}

	afterComplete(ast, newFileDir) {
		this.run(ast, newFileDir);
	}

	/**
	 * Adds a warning to the generated report for a node
	 * @param {Object} node - the node that triggered the warning
	 */
	reportWarning(node) {
		report.onWarning(this.getMessage(), esprima.generateCodeFromAST(node), node.loc.start.line);
	}
}

module.exports = BaseWarningPlugin;