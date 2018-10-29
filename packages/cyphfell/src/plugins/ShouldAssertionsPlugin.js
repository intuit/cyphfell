const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const esprima = require("../util/EsprimaUtils");

/**
 * This plugin transforms Cypress .then() closures which only have assertions performed in them into .should() blocks instead
 */
// TODO: make this plugin execute after WrapElementActions
class ShouldAssertionsPlugin extends BasePlugin {

	afterTransformAfterParsing(ast) {
		estraverse.traverse(ast, {
			enter: (node) => {
				// TODO: direct function calls like xyz().then(() => { ... }) instead of something.somethingElse().then(() => { ... });
				if (node.callee && node.callee.object && node.callee.object.type === "CallExpression" &&
                    node.callee.property && node.callee.object.callee.property && node.callee.property.name === "then" &&
                    (node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression") &&
                    node.arguments[0].body.body) {
					let allAssertions = true;
					for (const child of node.arguments[0].body.body) {
						const code = esprima.generateCodeFromAST(child);
						if (!code.includes("expect(") && !code.includes("assert(") && !code.includes(".should(") && !code.includes(".should.")
                            && !code.includes("assert.")) {
							allAssertions = false;
							break;
						}
					}
					if (allAssertions) {
						node.callee.property.name = "should";
					}
				}
			}
		});
	}

	getName() {
		return "ShouldAssertions";
	}
}

module.exports = ShouldAssertionsPlugin;