const sinon = require("sinon");
const LongWaitWarning = require("../../../src/plugins/LoopWarningsPlugin");
const esprima = require("../../../src/util/EsprimaUtils");
const FunctionBodyTransformer = require("../../../src/util/FunctionBodyTransformer");

describe("Tests the loop warning plugin", function() {
	const warning = new LongWaitWarning();

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(warning, "reportWarning");
	});

	it("Tests with no loops", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				call.someFunction();
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	it("Tests with a while loop with no commands inside of it", () => {
		warning.run(esprima.generateAST(`
			const x = () => {
				while (true) {
					doNothing();
				}
			};
		`));
		expect(warning.reportWarning.notCalled).to.be.true;
	});

	it("Tests with a while loop with cypress commands inside of it", () => {
		sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);
		warning.run(esprima.generateAST(`
			const x = () => {
				while (true) {
					doNothing();
				}
			};
		`));
		expect(warning.reportWarning.calledOnce).to.be.true;
	});

	it("Tests with a for loop with cypress commands inside of it", () => {
		sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);
		warning.run(esprima.generateAST(`
			const x = () => {
				for (let i = 0; i < 25; ++i) {
					doNothing();
				}
			};
		`));
		expect(warning.reportWarning.calledOnce).to.be.true;
	});

	it("Tests with a do loop with cypress commands inside of it", () => {
		sandbox.stub(FunctionBodyTransformer, "isPromiseChain").returns(() => true);
		warning.run(esprima.generateAST(`
			const x = () => {
				do {
					doNothing();
				} while (true);
			};
		`));
		expect(warning.reportWarning.calledOnce).to.be.true;
	});

	afterEach(() => {
		sandbox.restore();
	});
});