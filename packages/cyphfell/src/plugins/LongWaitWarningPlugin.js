const BaseWarning = require("../BaseWarningPlugin");
const estraverse = require("estraverse");
const MAX_WAIT_MILLISECONDS = require("../constants/WarningConstants").MAX_WAIT_MILLISECONDS;

/**
 * Detects when the user is waiting for a long time in their tests (this is an anti-pattern in Cypress)
 */
class LongWaitWarning extends BaseWarning {

	/**
	 * Walks the given AST and adds any warnings to the output report
	 * @param {Object} ast - the AST to walk
	 */
	run(ast) {
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "CallExpression" && node.callee.object && node.callee.object.name === "cy" && node.callee.property && node.callee.property.name === "wait" &&
					node.arguments[0] && node.arguments[0].type === "Literal" && !isNaN(node.arguments[0].value) && node.arguments[0].value > MAX_WAIT_MILLISECONDS) {
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
		return "LongWaitWarning";
	}

	getMessage() {
		return `You are waiting for more than ${MAX_WAIT_MILLISECONDS} milliseconds here. This is an anti-pattern in Cypress, and should be avoided.`;
	}
}

module.exports = LongWaitWarning;