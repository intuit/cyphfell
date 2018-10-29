const transformer = require("../../../src/util/FunctionBodyTransformer");
const sinon = require("sinon");

describe("Tests FunctionBodyTransformer isPromiseChain", function() {

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests non promise chain", () => {
		expect(
			transformer.isPromiseChain(`
                class X {
                    methodName() {
                        return true;
                    }
                    
                    xyz() {
                        return cy.get(".abc");
                    }
                    
                    method2() {
                        let x = 25;
                    }
                }
            `, `${process.cwd()}/test/something.js`)(`
                    methodName() {
                        return true;
                    }
                `, "this", "methodName", new Map())
		).to.be.false;

		expect(
			transformer.isPromiseChain(`
                class X {
                    methodName() {
                        return true;
                    }
                    
                    xyz() {
                        return cy.get(".abc");
                    }
                    
                    method2() {
                        let x = 25;
                    }
                }
            `, `${process.cwd()}/test/something.js`)(`
                    methodName() {
                        return cy.get(".abc");
                    }
                `, "this", "method2", new Map())
		).to.be.false;
	});

	it("Tests promise chain", () => {
		expect(
			transformer.isPromiseChain(`
                class X {
                    methodName() {
                        return true;
                    }
                    
                    xyz() {
                        return cy.getCookie(".abc");
                    }
                    
                    method2() {
                        let x = 25;
                    }
                }
            `, `${process.cwd()}/test/something.js`)(`
                    xyz() {
                        return cy.getCookie(".abc");
                    }
                `, "this", "xyz", new Map())
		).to.be.true;
	});

	// TODO: fix this
	/*it("Tests promise chain with imports", () => {

        sandbox.stub(fs, "readFileSync").returns(`
            class Y {
                asyncMethod() {
                    return cy.getCookie(".dyc");
                }
            }
        `);
        expect(
            transformer.isPromiseChain(`
                import Y from "./someFile.js";
                class X {
                    methodName() {
                        return Y.asyncMethod();
                    }

                    xyz() {
                        return cy.getCookie(".abc");
                    }

                    method2() {
                        let x = 25;
                    }
                }
            `, `${process.cwd()}/test/something.js`)(`
                    methodName() {
                        return Y.asyncMethod();
                    }
                `, "this", "methodName", new Map())
        ).to.be.true;
    });*/

	afterEach(() => {
		sandbox.restore();
	});
});
