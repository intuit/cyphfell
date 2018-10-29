const esprima = require("../../../src/util/EsprimaUtils");
const arrays = require("../../../src/CypressArrayUtil");
const _ = require("lodash");
let plugin = require("../../../src/plugins/ElementsIteratorsPlugin");
plugin = new plugin();
const sinon = require("sinon");

const FunctionBodyTransformer = require("../../../src/util/FunctionBodyTransformer");

describe("Tests ElementsIterators plugin", function () {

	let sandbox = null;

	before(() => {
		global.options = {
			transpile: false
		};
	});

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	arrays.modifiableIterators.forEach((name) => {
		it(`Tests replacing ${name} arrow function with ${arrays.getCypressFunction(name)}`, () => {
			sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);

			const ast = esprima.generateAST(`xyz.${name}(() => true);`);
			plugin.beforeTransformAfterParsing(ast);
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
							"name": arrays.getCypressFunction(name)
						}
					},
					"arguments": [
						{
							"type": "ArrowFunctionExpression",
							"id": null,
							"params": [],
							"body": {
								"type": "Literal",
								"value": true,
								"raw": "true"
							},
							"generator": false,
							"expression": true,
							"async": false
						}
					]
				}
			});
		});

		it(`Tests replacing ${name} regular function with ${arrays.getCypressFunction(name)}`, () => {
			sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);

			const ast = esprima.generateAST(`xyz.${name}(function() { return true; });`);
			plugin.beforeTransformAfterParsing(ast);
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
							"name": arrays.getCypressFunction(name)
						}
					},
					"arguments": [
						{
							"type": "FunctionExpression",
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


		it(`Tests to make sure object with non iterator ${name} function is not changed`, () => {
			sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);

			const ast = esprima.generateAST(`xyz.${name}()`);
			const copy = _.cloneDeep(ast);
			plugin.beforeTransformAfterParsing(ast);
			expect(ast).to.deep.equal(copy);

			const ast2 = esprima.generateAST(`xyz.${name}(true)`);
			const copy2 = _.cloneDeep(ast2);
			plugin.beforeTransformAfterParsing(ast2);
			expect(ast2).to.deep.equal(copy2);
		});
	});

	it("Tests plugin name", () => {
		expect(plugin.getName()).to.be.equal("ElementsIterators");
	});

	it("Tests to make sure object with non iterator function is not changed", () => {
		sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);
		const ast = esprima.generateAST("xyz.test(() => {return true;})");
		const copy = _.cloneDeep(ast);
		plugin.beforeTransformAfterParsing(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests to make sure conversions are not made when they don't need to be made", () => {
		const ast = esprima.generateAST(`
			function test(target) {
				for (var x = 0; x >= arguments.length; ++x) {
					if (true) {
						varName = varName.concat(Object.getSomethingRandom(source).filter(function (sym) {
							return Object.getSomething().something;
						}));
					}
				}
				return target;
			}
		`);
		const copy = _.cloneDeep(ast);
		plugin.beforeTransformAfterParsing(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests to make sure conversions are made when they need to be made", () => {
		const ast = esprima.generateAST(`
			function test(target) {
				for (var x = 0; x >= arguments.length; ++x) {
					if (true) {
						varName = varName.concat(Object.getSomethingRandom(source).filter(function (sym) {
							return cy.get(".abc").getAttribute();
						}));
					}
				}
				return target;
			}
		`);
		plugin.beforeTransformAfterParsing(ast);
		expect(ast).to.deep.equal(esprima.generateAST(`
			function test(target) {
				for (var x = 0; x >= arguments.length; ++x) {
					if (true) {
						varName = varName.concat(Object.getSomethingRandom(source).filterCypress(function (sym) {
							return cy.get(".abc").getAttribute();
						}));
					}
				}
				return target;
			}
		`));
	});

	afterEach(() => {
		sandbox.restore();
	});
});