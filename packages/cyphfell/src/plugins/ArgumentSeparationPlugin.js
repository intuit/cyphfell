const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const esprima = require("../util/EsprimaUtils");
const _ = require("lodash");

const getNewVarName = (funcName, varNamesMap, str) => {
	let timesCalled = varNamesMap.has(funcName) ? varNamesMap.get(funcName) + 1 : 1;
	let varName = null;
	while (!varName) {
		const newNameAttempt = `arg${funcName}${timesCalled}`;
		if (!str.includes(newNameAttempt)) {
			varName = newNameAttempt;
			varNamesMap.set(funcName, timesCalled);
			break;
		} else {
			++timesCalled;
		}
	}
	return varName;
};

const makeVariableDeclaration = (node, varNamesMap, str) => {
	const funcName = node.callee.property.name;
	const varName = getNewVarName(funcName, varNamesMap, str);

	return {
		type: "VariableDeclaration",
		declarations: [{
			type: "VariableDeclarator",
			init: node,
			id: {
				type: "Identifier",
				name: varName
			}
		}],
		kind: "const"
	};
};

/**
 * This plugin separates function call arguments which are the result of a call expression into separate variable declarations, which are
 * then passed into the call expression
 *
 * ex:
 * browser.xyz(something()) turns into
 *
 * const something1 = something()
 * browser.xyz(something1)
 */
class ArgumentSeparationPlugin extends BasePlugin {

	/**
     * Makes modifications to the AST after transforming the code after the initial regular expression conversion is finished
     * @param {Object} ast - the AST representing the code in a javascript file
     */
	beforeParseLines(ast) {

		/**
         * Maps each function name to the number of times it has been used as a variable
         * @type {Map<String, Number>}
         */
		const varNamesMap = new Map();
		estraverse.traverse(ast, {
			enter: (node, parent) => {
				node.parent = parent;
				// TODO: only if promise chain
				if (node.type === "CallExpression") {
					const containingBody = esprima.findBlock(node);
					if (!containingBody) {
						return;
					}
					const topLevelIndex = containingBody.body.indexOf(esprima.findTopLevelNode(node));
					let offset = 0;
					node.arguments.forEach((arg) => {
						// TODO: only if promise chain
						if (arg.type === "CallExpression") {
							const newVar = makeVariableDeclaration(_.cloneDeep(arg), varNamesMap, esprima.generateCodeFromAST(ast));
							containingBody.body.splice(topLevelIndex + offset, 0, newVar);
							Object.assign(arg, {
								type: "Identifier",
								name: newVar.declarations[0].id.name
							});
							++offset;
						}
					});
				}
			}
		});
		estraverse.traverse(ast, {
			enter: (node) => {
				delete node.parent;
			}
		});
	}

	/**
     * Gets the unique name of this plugin
     * @return {String} - the unique name of this plugin
     */
	getName() {
		return "ArgumentSeparation";
	}

}

module.exports = ArgumentSeparationPlugin;