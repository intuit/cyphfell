const index = require("../../index");
const sinon = require("sinon");
const fs = require("fs-extra");
const converter = require("../../src/converters/ActiveConverter");
const wdio = require("../../src/converters/wdio/WDIOStrategy");
const report = require("../../src/reports/ReportGenerator");
const dir = require("../../src/util/DirectoryUtils");
const handlers = require("../../src/handlers/FileHanderList");

describe("Tests the complete conversion process", function () {

	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(fs, "mkdirsSync");
		sandbox.stub(fs, "writeFileSync");
		sandbox.stub(fs, "mkdirSync");
		handlers.forEach((handler) => {
			sandbox.stub(handler, "parseImpl").returns("const x;");
		});
	});

	it("Tests to make sure the correct converter is selected by default", () => {
		sandbox.spy(converter, "init");
		sandbox.stub(dir, "getAllTestFiles").returns([]);

		index({validateCypressDir: false});
		expect(converter.init.calledOnce).to.be.true;
		expect(converter.getStrategy().getName()).to.be.equal(new wdio().getName(), "The WDIO strategy was not selected by default");
	});

	it("Tests to make sure a report is generated", () => {
		sandbox.spy(report, "generateReport");
		sandbox.stub(dir, "getAllTestFiles").returns([]);

		index({validateCypressDir: false});
		expect(report.generateReport.calledOnce).to.be.true;
	});

	it("Tests to make sure this file was converted", () => {
		index({validateCypressDir: false});

		let foundFile = false;
		for (let i = 0; i < fs.writeFileSync.callCount; ++i) {
			if (fs.writeFileSync.getCall(i).args[0] === `${process.cwd()}/test/cypress/integration/e2e/IndexTests.spec.js`) {
				foundFile = true;
				break;
			}
		}
		expect(foundFile).to.be.true;
	});

	afterEach(() => {
		sandbox.restore();
	});
});