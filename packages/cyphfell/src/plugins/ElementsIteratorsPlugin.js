const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const arrays = require("../CypressArrayUtil");
const FunctionBodyTransformer = require("../util/FunctionBodyTransformer");
const esprima = require("../util/EsprimaUtils");

/**
 * This plugin transforms array iterator functions that have asynchronous logic performed in them into an async equivalent of that function
 */
class ElementsIteratorsPlugin extends BasePlugin {

	beforeTransformAfterParsing(ast, newFileDir) {
		const filter = FunctionBodyTransformer.isPromiseChain(esprima.generateCodeFromAST(ast), newFileDir);
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.property &&
                    node.arguments[0] && (node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression") &&
					filter(esprima.generateCodeFromAST(node.arguments[0]), null, null, new Map())) {
					const cyFunc = arrays.getCypressFunction(node.callee.property.name);
					if (cyFunc) {
						node.callee.property.name = cyFunc;
					}
				}
			}
		});
	}

	/**
     * Gets the unique name of this plugin
     * @return {String} - the unique name of this plugin
     */
	getName() {
		return "ElementsIterators";
	}

}

module.exports = ElementsIteratorsPlugin;