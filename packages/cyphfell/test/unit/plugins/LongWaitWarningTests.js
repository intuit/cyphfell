const sinon = require("sinon");
const LongWaitWarning = require("../../../src/plugins/LongWaitWarningPlugin");
const esprima = require("../../../src/util/EsprimaUtils");
const MAX_WAIT_MILLISECONDS = require("../../../src/constants/WarningConstants").MAX_WAIT_MILLISECONDS;

describe("Tests the long wait warning", function() {
	const warning = new LongWaitWarning();

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(warning, "reportWarning");
	});

	it("Tests with no waits", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				cy.doSomething();
				cy.xyz();
				browser.wait(25);
				browser.pause(55);
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	it("Tests with short waits", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				cy.doSomething();
				cy.xyz();
				cy.wait(${MAX_WAIT_MILLISECONDS / 2});
				browser.pause(55);
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	it("Tests with long waits", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				cy.doSomething();
				cy.xyz();
				cy.wait(${MAX_WAIT_MILLISECONDS + 1});
				cy.wait(${MAX_WAIT_MILLISECONDS + 5000});
			};
		`));
		expect(warning.reportWarning.calledTwice).to.be.true;
		expect(warning.reportWarning.getCall(0).args[0]).to.deep.equal(esprima.generateAST(`cy.wait(${MAX_WAIT_MILLISECONDS + 1})`).body[0].expression);
		expect(warning.reportWarning.getCall(1).args[0]).to.deep.equal(esprima.generateAST(`cy.wait(${MAX_WAIT_MILLISECONDS + 5000})`).body[0].expression);
	});

	it("Tests with a wait with an identifier instead of a literal", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				const yz = ${MAX_WAIT_MILLISECONDS + 999};
				cy.doSomething();
				cy.xyz();
				cy.wait(yz);
				browser.pause(55);
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	it("Tests with a wait with a string instead of a number", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				cy.doSomething();
				cy.xyz();
				cy.wait("${MAX_WAIT_MILLISECONDS}");
				browser.pause(55);
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	afterEach(() => {
		sandbox.restore();
	});
});