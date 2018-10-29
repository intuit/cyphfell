const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const esprima = require("../util/EsprimaUtils");
const isPromiseChain = require("../util/FunctionBodyTransformer").isPromiseChain;

const findCommonFunctionAncestor = (node, other) => {
	const lookForFunctions = (astNode, list) => {
		let currentNode = astNode;
		while (currentNode) {
			if (esprima.isFunctionStartNode(currentNode)) {
				list.push(currentNode);
			}
			currentNode = currentNode.parent;
		}
	};

	const firstFunctions = [];
	const secondFunctions = [];
	lookForFunctions(node, firstFunctions);
	lookForFunctions(other, secondFunctions);

	for (const n1 of firstFunctions) {
		for (const n2 of secondFunctions) {
			if (n1 === n2) {
				return n1;
			}
		}
	}
	return null;
};

/**
 * This plugin wraps return statements in some weird scenarios where Cypress commands are executed in a block, and then there is a return statement outside of that block
 * that should get executed after the block finishes execution
 */
class WrapReturnsPlugin extends BasePlugin {

	afterTransformAfterParsing(ast, newFileDir) {
		const wrapReturnsAfter = isPromiseChain(esprima.generateCodeFromAST(ast), newFileDir);

		const potentialWrappers = [];
		let index = 0;
		estraverse.traverse(ast, {
			enter: (node, parent) => {
				node.parent = parent;
				node.index = index++;

				if (node.type === "CallExpression") {
					const details = esprima.getCallExpressionDetails(node);
					const code = esprima.generateCodeFromAST(node);
					// fix "cy.get(something).then(" not working
					if ((code.includes("cy.get(") && code.includes(").then(")) || wrapReturnsAfter(code, details.identifier, details.property, new Map())) {
						potentialWrappers.push(node);
					}
				}
			}
		});

		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "ReturnStatement" && node.argument && !(node.argument.type === "CallExpression" && node.argument.callee.type === "MemberExpression" &&
                        node.argument.callee.object && node.argument.callee.object.name === "cy" && node.argument.callee.property.name === "wrap") &&
                    (node.argument.type === "Identifier" || node.argument.type === "Literal")) {

					// TODO: also add support for everything except promise chain function calls and already wrapped returns
					for (const wrapper of potentialWrappers) {
						let common;
						if (wrapper.index < node.index && esprima.findBlock(node) !== esprima.findBlock(wrapper) && (common = findCommonFunctionAncestor(node, wrapper))) {
							if (node !== common.body.body[common.body.body.length - 1] && common.body.body[common.body.body.length - 1].type !== "IfStatement") {
								continue;
							}
							node.argument = {
								type: "CallExpression",
								callee: {
									type: "MemberExpression",
									computed: false,
									object: {
										type: "Identifier",
										name: "cy"
									},
									property: {
										type: "Identifier",
										name: "wrap"
									},
								},
								arguments: [node.argument]
							};
							break;
						}
					}
				}
			}
		});

		estraverse.traverse(ast, {
			enter: (node) => {
				delete node.parent;
				delete node.index;
			}
		});
	}

	getName() {
		return "WrapReturns";
	}
}

module.exports = WrapReturnsPlugin;