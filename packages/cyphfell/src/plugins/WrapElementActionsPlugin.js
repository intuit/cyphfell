const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const commandsToWrap = require("../constants/CommandsToWrap");
const _ = require("lodash");
const esprima = require("../util/EsprimaUtils");

const wrapActions = (ast) => {
	estraverse.traverse(ast, {
		enter: (node) => {
			if (node.callee && node.callee.object && node.callee.object.type === "CallExpression" &&
				node.callee.property && node.callee.object.callee.property && node.callee.property.name === "then" &&
				(node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression")) {

				estraverse.traverse(node.arguments[0], {
					enter: (functionNode) => {
						// if this is a literal or an entry from an array and a browser command is being invoked on it, wrap the invoked object with cy.wrap()
						if (functionNode.type === "CallExpression" && functionNode.callee.property && functionNode.callee.property.name
							&& commandsToWrap.includes(functionNode.callee.property.name) && (functionNode.callee.object.type === "Identifier" ||
								(functionNode.callee.object.type === "MemberExpression" && functionNode.callee.object.computed && functionNode.callee.object.object.type === "Identifier" && functionNode.callee.object.property.type === "Literal"))) {
							const copy = _.cloneDeep(functionNode.callee.object);
							Object.assign(functionNode.callee.object, {
								type: "CallExpression",
								callee: {
									type: "MemberExpression",
									object: {
										type: "Identifier",
										name: "cy"
									},
									property: {
										type: "Identifier",
										name: "wrap"
									},
									computed: false
								},
								arguments: [copy]
							});
							delete functionNode.callee.object.name;
						}
					}
				});
			}
		}
	});
};

/**
 * Simplifies wrapped command closures so that they are less verbose
 * Example: cy.get(".abc").then((param) => {
 * 		cy.wrap(param).click();
 * 		return cy.wrap(param).getText();
 * });
 * becomes cy.get(".abc").click().getText();
 * @param {Object} ast - the AST to search for closures to simplify
 */
const simplifyWraps = (ast) => {
	const isWrap = (n, identifier) => {
		return n.type === "CallExpression" && n.callee.type === "MemberExpression"
			&& n.callee.object.type === "CallExpression" && n.callee.object.callee.type === "MemberExpression" &&
			n.callee.object.callee.object.name === "cy" && n.callee.object.callee.property.name === "wrap" && n.callee.object.arguments && n.callee.object.arguments[0] &&
			n.callee.object.arguments[0].type === "Identifier" && n.callee.object.arguments[0].name === identifier;
	};
	estraverse.traverse(ast, {
		enter: (node) => {
			if (esprima.isThenStatement(node) && (node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression")) {
				let allWrapped;
				const wrappedFunctions = [];
				for (const currentNode of node.arguments[0].body.body) {
					if (currentNode.type === "EmptyStatement") {
						continue;
					} else if (currentNode.type === "ExpressionStatement" && currentNode.expression.callee) {
						allWrapped = isWrap(currentNode.expression, node.arguments[0].params[0].name);
						if (allWrapped) {
							wrappedFunctions.push(currentNode.expression.callee.property.name);
						}
					} else if (currentNode.type === "ReturnStatement" && currentNode.argument && currentNode.argument.type === "CallExpression") {
						allWrapped = isWrap(currentNode.argument, node.arguments[0].params[0].name);
						if (allWrapped) {
							wrappedFunctions.push(currentNode.argument.callee.property.name);
						}
					} else {
						allWrapped = false;
					}

					if (!allWrapped) {
						break;
					}
				}
				if (allWrapped) {
					let code = esprima.generateCodeFromAST(node).split(".then")[0];
					code += "." + wrappedFunctions.join("().") + "()";
					Object.assign(node, esprima.generateAST(code).body[0]);
				}
			}
		}
	});
};

/**
 * This plugin wraps browser element action commands within a .then() closure with cy.wrap()
 */
class WrapElementActionsPlugin extends BasePlugin {

	/**
     * Makes modifications to the AST after transforming the code after the initial regular expression conversion is finished
     * @param {Object} ast - the AST representing the code in a javascript file
     */
	afterTransformAfterParsing(ast) {
		wrapActions(ast);
		simplifyWraps(ast);
	}

	/**
     * Gets the unique name of this plugin
     * @return {String} - the unique name of this plugin
     */
	getName() {
		return "WrapElementActions";
	}

}

module.exports = WrapElementActionsPlugin;