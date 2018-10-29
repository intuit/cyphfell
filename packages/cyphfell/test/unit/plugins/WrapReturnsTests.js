const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");
let plugin = require("../../../src/plugins/WrapReturnsPlugin");
plugin = new plugin();

describe("Tests WrapReturnsPlugin", function() {

    before(() => {
        global.options = {
            transpile: false
        };
    });

    it("Tests case when no modifications should be made", () => {
        const ast = esprima.generateAST(`const y = () => {
            if (true) {
                const x = 25;
                return x;
            }
        };`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    /*it("Tests nested return", () => {
        const ast = esprima.generateAST(`const y = () => {
            if (true) {
                return browser.waitUntil().then(() => {
                    return true;
                });
            }
        };`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });*/

    it("Tests already wrapped return", () => {
        const ast = esprima.generateAST(`const y = () => {
            if (true) {
                return browser.waitUntil().then(() => {
                    return cy.wrap(true);
                });
            }
        };`);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests return in a different block when no changes should be made", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                let something = 1;
                if (true) {
                    cy.get('.class').click();
                }
                return something;
            };
        `);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests return in a different block when changes should be made", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                let something = 1;
                if (true) {
                    cy.get('.class').then((res) => {
                        something = res;
                    });
                }
                return something;
            };
        `);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
             const y = () => {
                let something = 1;
                if (true) {
                    cy.get('.class').then((res) => {
                        something = res;
                    });
                }
                return cy.wrap(something);
            }; 
        `));
    });

    it("Tests return in a different block when changes should be made with browser.waitUntil", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                if (true) {
                    browser.waitUntil(() => true);
                }
                return x;
            };
        `);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
             const y = () => {
                if (true) {
                    browser.waitUntil(() => true);
                }
                return cy.wrap(x);
            }; 
        `));
    });

    it("Tests getName()", () => {
        expect(plugin.getName()).to.be.equal("WrapReturns");
    });

    it("Tests return in a promise that should not be wrapped", () => {
        const ast = esprima.generateAST(`
            const x = function(vendorObject) {
                let response;
                const testService = SomeClass.doSomething(this.configObject, "vendor", vendorObject, "post").then(function(someResponse) {
                    response = someResponse.ResponseValue;
                    return true;
                });
                return browser.waitUntil(testService).then(waitUntil1 => {
                    return response;
                });
            };
        `);
        const copy = _.cloneDeep(ast);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
    });

    it("Tests return at the top level that should be wrapped", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                let response;
                let someVar = this.someMethod(accountObject.Name);
                if (someVar) {
                    response = someVar;
                    browser.waitUntil(promise);
                } else {
                    const promise = SomeClass.doSomething(this.configObject, "account", accountObject).then(function (res) {
                        response = res;
                        return true;
                    });
                    browser.waitUntil(promise);
                }
                return response;
            };
        `);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
             const y = () => {
                let response;
                let someVar = this.someMethod(accountObject.Name);
                if (someVar) {
                    response = someVar;
                    browser.waitUntil(promise);
                } else {
                    const promise = SomeClass.doSomething(this.configObject, "account", accountObject).then(function (res) {
                        response = res;
                        return true;
                    });
                    browser.waitUntil(promise);
                }
                return cy.wrap(response);
            }; 
        `));
    });

    it("Tests wrapping a nested return statement", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                return this.someMethod().then((s) => {
                    let response;
                    if (s) {
                        response = s;
                        browser.waitUntil(promise);
                    } else {
                        const promise = SomeClass.doSomething(this.configObject, "account", accountObject).then(function (res) {
                            response = res;
                            return true;
                        });
                        browser.waitUntil(promise);
                    }
                    return response;
                });
            };
        `);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
             const y = () => {
                return this.someMethod().then((s) => {
                    let response;
                    if (s) {
                        response = s;
                        browser.waitUntil(promise);
                    } else {
                        const promise = SomeClass.doSomething(this.configObject, "account", accountObject).then(function (res) {
                            response = res;
                            return true;
                        });
                        browser.waitUntil(promise);
                    }
                    return cy.wrap(response);
                });
            };
        `));
    });

    it("Tests wrapping a node when it is not the last one in a function body", () => {
        const ast = esprima.generateAST(`
            const y = () => {
                browser.waitUntil(abc);
                if (true) {
                    return true;
                } else {
                    return 25;
                }
            };
        `);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
             const y = () => {
                browser.waitUntil(abc);
                if (true) {
                    return cy.wrap(true);
                } else {
                    return cy.wrap(25);
                }
            };
        `));
    });
});