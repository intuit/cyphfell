const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");
let plugin = require("../../../src/plugins/LambdaExpressionsPlugin");
plugin = new plugin();

describe("Tests LambdaExpressions plugin", function() {
	before(() => {
		global.options = {
			transpile: false
		};
	});

	it("Tests to make sure Lambda expressions are changed", () => {
		const ast = esprima.generateAST("xyz.randomFuncName(() => true)");
		plugin.beforeParseLines(ast);
		expect(ast.body[0]).to.deep.equal({
			"type": "ExpressionStatement",
			"expression": {
				"type": "CallExpression",
				"callee": {
					"type": "MemberExpression",
					"computed": false,
					"object": {
						"type": "Identifier",
						"name": "xyz"
					},
					"property": {
						"type": "Identifier",
						"name": "randomFuncName"
					}
				},
				"arguments": [
					{
						"type": "ArrowFunctionExpression",
						"id": null,
						"params": [],
						"body": {
							"type": "BlockStatement",
							"body": [
								{
									"type": "ReturnStatement",
									"argument": {
										"type": "Literal",
										"value": true,
										"raw": "true"
									}
								}
							]
						},
						"generator": false,
						"expression": false,
						"async": false
					}
				]
			}
		});
	});

	it("Tests to make sure non-expression Lambda functions are not changed", () => {
		const ast = esprima.generateAST("xyz.randomFuncName(() => {return true;})");
		const copy = _.cloneDeep(ast);
		plugin.beforeParseLines(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests plugin name", () => {
		expect(plugin.getName()).to.be.equal("LambdaExpressions");
	});

});