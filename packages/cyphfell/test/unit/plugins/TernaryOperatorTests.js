const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");
let plugin = require("../../../src/plugins/TernaryOperatorPlugin");
plugin = new plugin();

describe("Tests TernaryOperators plugin", function() {
    before(() => {
        global.options = {
            transpile: false
        };
    });

    it(`Tests to make sure ternary operators are not changed if they are not the final statement in a block`, () => {
        const ast = esprima.generateAST(`xyz.randomFuncName(() => { const x = true ? 2 : 1; return x; })`);
        const copy = _.cloneDeep(ast);
        plugin.beforeTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests to make sure ternary operators are changed if they are the final statement in a block", () => {
        const ast = esprima.generateAST(`xyz.randomFuncName(() => {let x = 5; return true ? 2 : 1;})`);
        const copy = _.cloneDeep(ast);
        plugin.beforeTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests plugin name", () => {
        expect(plugin.getName()).to.be.equal("TernaryOperator");
    });

    it(`Tests to make sure ternary operators are not changed if they are in an ObjectExpression`, () => {
        const ast = esprima.generateAST(`const x = {prop: true ? 25 : 3}`);
        const copy = _.cloneDeep(ast);
        plugin.beforeTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it(`Tests to make sure no error happens if a ternary operator expression has no parent block`, () => {
        const ast = esprima.generateAST(`const x = true ? 25 : 3;`);
        const copy = _.cloneDeep(ast);
        plugin.beforeTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests to make sure ternary operators are changed if a return function call is the consequent and alternate", () => {
        const cleanAST = (tree) => {
            return esprima.generateAST(esprima.generateCodeFromAST(tree)).body[0];
        };
        const ast = esprima.generateAST(`xyz.randomFuncName(() => {let x = 5; return true ? xyz.func() : z.func2();})`);
        plugin.beforeTransformAfterParsing(ast);
        expect(cleanAST(ast.body[0])).to.deep.equal({
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
                                    "type": "VariableDeclaration",
                                    "declarations": [
                                        {
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "type": "Identifier",
                                                "name": "x"
                                            },
                                            "init": {
                                                "type": "Literal",
                                                "value": 5,
                                                "raw": "5"
                                            }
                                        }
                                    ],
                                    "kind": "let"
                                },
                                {
                                    "type": "IfStatement",
                                    "test": {
                                        "type": "Literal",
                                        "value": true,
                                        "raw": "true"
                                    },
                                    "consequent": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "ReturnStatement",
                                                "argument": {
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
                                                            "name": "func"
                                                        }
                                                    },
                                                    "arguments": []
                                                }
                                            }
                                        ]
                                    },
                                    "alternate": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "ReturnStatement",
                                                "argument": {
                                                    "type": "CallExpression",
                                                    "callee": {
                                                        "type": "MemberExpression",
                                                        "computed": false,
                                                        "object": {
                                                            "type": "Identifier",
                                                            "name": "z"
                                                        },
                                                        "property": {
                                                            "type": "Identifier",
                                                            "name": "func2"
                                                        }
                                                    },
                                                    "arguments": []
                                                }
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

    it("Tests to make sure ternary operators are changed if a return function call is the consequent and alternate", () => {
        const cleanAST = (tree) => {
            return esprima.generateAST(esprima.generateCodeFromAST(tree)).body[0];
        };
        const ast = esprima.generateAST(`xyz.randomFuncName(() => {let x = 5; const a = false ? xyz.func() : z.func2();})`);
        plugin.beforeTransformAfterParsing(ast);
        expect(cleanAST(ast.body[0])).to.deep.equal({
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
                                    "type": "VariableDeclaration",
                                    "declarations": [
                                        {
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "type": "Identifier",
                                                "name": "x"
                                            },
                                            "init": {
                                                "type": "Literal",
                                                "value": 5,
                                                "raw": "5"
                                            }
                                        }
                                    ],
                                    "kind": "let"
                                },
                                {
                                    "type": "IfStatement",
                                    "test": {
                                        "type": "Literal",
                                        "value": false,
                                        "raw": "false"
                                    },
                                    "consequent": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "VariableDeclaration",
                                                "declarations": [
                                                    {
                                                        "type": "VariableDeclarator",
                                                        "id": {
                                                            "type": "Identifier",
                                                            "name": "a"
                                                        },
                                                        "init": {
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
                                                                    "name": "func"
                                                                }
                                                            },
                                                            "arguments": []
                                                        }
                                                    }
                                                ],
                                                "kind": "const"
                                            }
                                        ]
                                    },
                                    "alternate": {
                                        "type": "BlockStatement",
                                        "body": [
                                            {
                                                "type": "VariableDeclaration",
                                                "declarations": [
                                                    {
                                                        "type": "VariableDeclarator",
                                                        "id": {
                                                            "type": "Identifier",
                                                            "name": "a"
                                                        },
                                                        "init": {
                                                            "type": "CallExpression",
                                                            "callee": {
                                                                "type": "MemberExpression",
                                                                "computed": false,
                                                                "object": {
                                                                    "type": "Identifier",
                                                                    "name": "z"
                                                                },
                                                                "property": {
                                                                    "type": "Identifier",
                                                                    "name": "func2"
                                                                }
                                                            },
                                                            "arguments": []
                                                        }
                                                    }
                                                ],
                                                "kind": "const"
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
});