const BasePlugin = require("../BasePlugin");
const estraverse = require("estraverse");
const _ = require("lodash");

const replaceChild = (node, childToFind, replaceWith) => {
	estraverse.traverse(node, {
		enter: function(child, parent) {
			if (_.isEqual(child, childToFind)) {
				Object.keys(parent).forEach((key) => {
					if (parent[key] === child) {
						parent[key] = replaceWith;
					}
				});
			}
		}
	});
	return node;
};

/**
 * This plugin transforms ternary operators call expressions with WDIO commands in them into an if/else if format
 */
class TernaryOperatorPlugin extends BasePlugin {

	beforeTransformAfterParsing(ast) {
		estraverse.traverse(ast, {
			enter: function(node, parent) {
				node.parent = parent;
				if (node.type === "ObjectExpression") {
					this.skip();
				}
				if (node.type === "ConditionalExpression") {
					let current = node;
					let previous = node;
					while (current) {
						if (current.type === "BlockStatement") {
							break;
						}
						previous = current;
						current = current.parent;
					}
					if (!current) {
						this.break();
						return;
					}

					if (current.body[current.body.length - 1] !== previous) {
						return;
					}

					const alternate = node.alternate;
					const consequent = node.consequent;
					const newAlternate = replaceChild(_.cloneDeep(previous), node, alternate);
					const newConsequent = replaceChild(_.cloneDeep(previous), node, consequent);

					if (newAlternate.type === "VariableDeclaration") {
						if (newAlternate.declarations[0].init.type !== "CallExpression" || newConsequent.declarations[0].init.type !== "CallExpression") {
							return;
						}
					} else if (newAlternate.type === "ReturnStatement") {
						if (newAlternate.argument.type !== "CallExpression" || newConsequent.argument.type !== "CallExpression") {
							return;
						}
					}
					// TODO: promise chains only
					/*const str = esprima.generateCodeFromAST(ast);
                    if (!promiseChain(str, "")(str, ) && !promiseChain(str, ""))*/

					Object.assign(previous, {
						type: "IfStatement",
						alternate: {
							type: "BlockStatement",
							body: [newAlternate]
						},
						consequent: {
							type: "BlockStatement",
							body: [newConsequent]
						},
						test: node.test
					});
				}
			}
		});
		estraverse.traverse(ast, {
			enter: function(node) {
				delete node.parent;
			}
		});
	}

	getName() {
		return "TernaryOperator";
	}
}

module.exports = TernaryOperatorPlugin;