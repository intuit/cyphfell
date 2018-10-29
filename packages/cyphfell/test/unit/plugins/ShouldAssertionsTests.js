const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");
let plugin = require("../../../src/plugins/ShouldAssertionsPlugin");
plugin = new plugin();

describe("Tests ShouldAssertions plugin", function() {
    before(() => {
        global.options = {
            transpile: false
        };
    });

    it(`Tests to make sure then statements with just assertions are changed to should`, () => {
        const ast = esprima.generateAST(`test.xyz().then(() => {expect(true).to.be.equal(false); false.should.be.equal(true); assert.isTrue(true);})`);
        plugin.afterTransformAfterParsing(ast);
        expect(ast.body[0]).to.deep.equal({
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "test"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "xyz"
                            }
                        },
                        "arguments": []
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "should"
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
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "MemberExpression",
                                                    "computed": false,
                                                    "object": {
                                                        "type": "CallExpression",
                                                        "callee": {
                                                            "type": "Identifier",
                                                            "name": "expect"
                                                        },
                                                        "arguments": [
                                                            {
                                                                "type": "Literal",
                                                                "value": true,
                                                                "raw": "true"
                                                            }
                                                        ]
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "to"
                                                    }
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "be"
                                                }
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "equal"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "Literal",
                                                "value": false,
                                                "raw": "false"
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "MemberExpression",
                                                    "computed": false,
                                                    "object": {
                                                        "type": "Literal",
                                                        "value": false,
                                                        "raw": "false"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "should"
                                                    }
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "be"
                                                }
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "equal"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "Literal",
                                                "value": true,
                                                "raw": "true"
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "type": "Identifier",
                                                "name": "assert"
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "name": "isTrue"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "type": "Literal",
                                                "value": true,
                                                "raw": "true"
                                            }
                                        ]
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

    it(`Tests to make sure non-then statements with just assertions are not changed`, () => {
        const ast = esprima.generateAST(`test.xyz().randomFunc(() => {expect(true).to.be.equal(false); false.should.be.equal(true); assert.isTrue(true);})`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests to make sure then statements with no assertions are not changed", () => {
        const ast = esprima.generateAST(`test.xyz().then(() => {return true;})`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests to make sure then statements with some assertions are not changed", () => {
        const ast = esprima.generateAST(`test.xyz().then(() => {expect(true).to.be.equal(false); return true;})`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests plugin name", () => {
        expect(plugin.getName()).to.be.equal("ShouldAssertions");
    });

});