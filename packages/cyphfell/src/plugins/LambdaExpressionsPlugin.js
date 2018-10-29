const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");

/**
 * This plugin transforms lambda arrow function expressions into a normal arrow function call
 * ex:
 *
 * abc.xyz(() => true) turns into
 * abc.xyz(() => {
 * 		return true;
 * });
 */
class LambdaExpressionsPlugin extends BasePlugin {

	beforeParseLines(ast) {
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "ArrowFunctionExpression" && !node.body.body) {
					node.body = {
						type: "BlockStatement",
						body: [
							{
								type: "ReturnStatement",
								argument: node.body
							}
						]
					};
					node.expression = false;
				}
			}
		});
	}

	getName() {
		return "LambdaExpressions";
	}
}

module.exports = LambdaExpressionsPlugin;