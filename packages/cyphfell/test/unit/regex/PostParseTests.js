const rewire = require("rewire");
const util = rewire("../../../src/regex/PostParseRegex.js");
const esprima = require("../../../src/util/EsprimaUtils");

describe("Tests after parse completion RegEx functions", function() {

    it("Tests removing unnecessary closures", () => {
        const fn = util.__get__("removeUnnecessaryClosures");
        expect(fn("xyz.then(varName => {   const x = varName;  });")).to.be.equal("xyz.then(varName => {   const x = varName;  });");
        expect(fn("xyz.then(varName => {   varName;  });")).to.be.equal("xyz;");
        expect(fn("xyz.then(varName => {});")).to.be.equal("xyz;");
        expect(fn("xyz.then(varName => {return varName;});")).to.be.equal("xyz;");
        expect(fn("xyz.then(varName => {return someOtherVar;});")).to.be.equal("xyz.then(varName => {return someOtherVar;});");
        expect(fn(".then(varName => {   const x = varName;  });")).to.be.equal(".then(varName => {   const x = varName;  });");
        expect(fn(".then(varName => {   varName;  });")).to.be.equal(";");
    });

    it("Tests removing unnecessary expressions", () => {
        const toAST = (fn, str) => {
            return esprima.generateAST(fn(str)).body[0];
        };

        const assertSame = (fn, str) => {
            expect(toAST(fn, str)).to.deep.equal(esprima.generateAST(str).body[0]);
        };

        const fn = util.__get__("removeUnnecessaryExpressions");
        expect(toAST(fn, "() => {xyz.then(varName => {    varName; doSomething.else(); });}")).to.deep.equal({
            "type": "ExpressionStatement",
            "expression": {
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
                                        "type": "Identifier",
                                        "name": "xyz"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "then"
                                    }
                                },
                                "arguments": [
                                    {
                                        "type": "ArrowFunctionExpression",
                                        "id": null,
                                        "params": [
                                            {
                                                "type": "Identifier",
                                                "name": "varName"
                                            }
                                        ],
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
                                                                "type": "Identifier",
                                                                "name": "doSomething"
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "else"
                                                            }
                                                        },
                                                        "arguments": []
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
                        }
                    ]
                },
                "generator": false,
                "expression": false,
                "async": false
            }
        });
        assertSame(fn, "xyz.then(varName => { varName.somethingWith(); });");
        assertSame(fn, "xyz.then(varName => { somethingWith(varName); });");
        assertSame(fn, "xyz.then(varName => { return varName; });");
        assertSame(fn, "xyz.then(varName => {         global.something.somethingWith(varName); });");
    });

    it("Tests removeUnnecessaryVariables function", () => {
        const fn = util.__get__("removeUnnecessaryVariables");
        expect(fn("xyz.then(a => {});")).to.be.equal("xyz.then(a => {});");
        expect(fn("xyz.then(a => {let xyza = a;});")).to.be.equal("xyz.then(a => {let xyza = a;});");
        expect(fn("xyz.then(a => {const xyz2 = a;});")).to.be.equal("xyz.then(xyz2 => {});");
    });

    it("Tests PostParseRegex export function", () => {
        expect(util("")).to.be.equal("", "No input failed");

        expect(util(".then(())AIOOIOOIIWOAJEOIWAJEJIQU$(*@#U(@#U(@Q#U@(QU#(QJIEQOIJEIOWQJEOIIJEIOQWJIEWQEQEW")).to.be.equal(".then(())AIOOIOOIIWOAJEOIWAJEJIQU$(*@#U(@#U(@Q#U@(QU#(QJIEQOIJEIOWQJEOIIJEIOQWJIEWQEQEW", "Long input failed");

        let removedUnnecessaryClosures = false;
        let removedUnnecessaryExpressions = false;
        const oldRUC = util.__get__("removeUnnecessaryClosures");
        const oldRUE = util.__get__("removeUnnecessaryExpressions");
        util.__set__("removeUnnecessaryClosures", (param) => {
            removedUnnecessaryClosures = true;
            return param;
        });
        util.__set__("removeUnnecessaryExpressions", (param) => {
            removedUnnecessaryExpressions = true;
            return param;
        });
        expect(util("test")).to.be.equal("test");
        expect(removedUnnecessaryClosures).to.be.true;
        expect(removedUnnecessaryExpressions).to.be.true;

        util.__set__("removeUnnecessaryClosures", oldRUC);
        util.__set__("removeUnnecessaryExpressions", oldRUE);
    });
});