const sinon = require("sinon");
const glob = require("glob");
const fs = require("fs");
const rewire = require("rewire");
const dir = rewire("../../../src/util/DirectoryUtils");

const testFiles = [{
	name: "testFile.js",
	contents: "class TestClass { }",
	modifiedName: "testFilejs"
}, {
	name: "directoryName/src/File2.js",
	contents: "class RandomClass { testMethod() { } }",
	modifiedName: "File2js"
}];

describe("Tests DirectoryUtils functions", function () {

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests the getAllTestFiles method", () => {
		glob.sync = sandbox.stub().returns(testFiles.map((fileInfo) => fileInfo.name));
		sandbox.stub(fs, "readFileSync");
		testFiles.forEach((fileInfo) => {
			fs.readFileSync.withArgs(fileInfo.name, "utf8").returns(fileInfo.contents);
		});
		dir.getAllTestFiles("!(node_modules)/**/*.js").forEach((file) => {
			const matching = testFiles.find((testFile) => testFile.name === file.path);
			expect(matching).to.exist;
			expect(file.contents).to.be.equal(matching.contents);
			expect(file.fileName).to.be.equal(matching.modifiedName);
		});
	});

	it("Tests the verifyCypressDirectory method when the cypress folder already exists", () => {
		sandbox.stub(fs, "existsSync").returns(true);
		sandbox.stub(fs, "mkdirSync").returns(true);
		sandbox.stub(fs, "writeFileSync");
		dir.verifyCypressDirectory("test/cypress");
		expect(fs.writeFileSync.calledOnce).to.be.true;
	});

	it("Tests the verifyCypressDirectory method when the cypress folder does not exist", () => {
		sandbox.stub(fs, "existsSync").returns(false);
		sandbox.stub(fs, "writeFileSync");
		sandbox.stub(fs, "mkdirSync");
		sandbox.stub(fs, "readFileSync").returns(JSON.stringify({path: "test/cypress"}));

		dir.verifyCypressDirectory("test/folder/cypress");
		expect(JSON.parse(fs.writeFileSync.getCall(3).args[1])).to.deep.equal({path: "test/folder/cypress"});
	});

	it("Tests new cypress.json contents when that file already exists", () => {
		const baseCypressJson = {
			baseUrl: "https://qbo.intuit.com",
			supportFile: "cypress/support/initial.js",
			path: "test2"
		};

		sandbox.stub(fs, "existsSync").returns(false);
		sandbox.stub(fs, "writeFileSync");
		sandbox.stub(fs, "mkdirSync");
		sandbox.stub(fs, "readFileSync").returns(JSON.stringify({path: "test/cypress"}));
		fs.existsSync.withArgs(`${process.cwd()}/cypress.json`).returns(true);
		fs.readFileSync.withArgs(`${process.cwd()}/cypress.json`).returns(JSON.stringify(baseCypressJson));

		dir.verifyCypressDirectory("test/folder/cypress");
		expect(JSON.parse(fs.writeFileSync.getCall(3).args[1])).to.deep.equal(Object.assign({path: "test/folder/cypress"}, baseCypressJson));
	});

	it("Tests the getNewFilePath method", () => {
		expect(dir.getNewFilePath(`${process.cwd()}/package.json`)).to.be.equal(`${process.cwd()}/package.json`, "Root level path was changed");
		sandbox.stub(dir, "isTestFile").returns(true);

		expect(dir.getNewFilePath(`${process.cwd()}/test/file.js`, "", {cypressFolder: "test/cypress", baseNormalFolder: "test/"})).to.be
			.equal(`${process.cwd()}/test/cypress/integration/file.spec.js`, "New path did not point to the correct integration folder");

		sandbox.restore();
		sandbox.stub(dir, "isTestFile").returns(false);
		expect(dir.getNewFilePath(`${process.cwd()}/test/file.js`, "", {cypressFolder: "test/cypress", baseNormalFolder: "test/"})).to.be
			.equal(`${process.cwd()}/test/cypress/file.js`, "New path did not point to the cypress folder");
	});

	afterEach(() => {
		sandbox.restore();
	});
});


describe("Tests whether a file is a Mocha test file", function() {

	let fn = null;
	let sandbox = null;

	before(() => {
		fn = dir.__get__("containsFunction");
		global.options = {
			moduleResolvePaths: []
		};
	});

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests empty file", () => {
		expect(fn("", "", "describe")).to.be.false;
	});

	it("Tests file with no imports", () => {
		expect(fn("const x = () => {};", "", "describe")).to.be.false;
	});

	it("Tests file and match", () => {
		expect(fn("describe(\"Test suite name\", function() { });", "", "describe")).to.be.true;
	});

	it("Tests file no match with 'from' in import statement", () => {
		expect(fn("import Stuff from \"./somePath.js\"", "", "describe")).to.be.false;
	});

	it("Tests file and match in an imported file", () => {
		sandbox.stub(fs, "readFileSync").returns(`
            describe("Suite 1 name", function() {
            
            });
            
            describe("Suite 2 name", function() {
            
            });
        `);
		expect(fn("import \"./somePath.js\"", "", "describe")).to.be.true;
	});

	it("Tests file and no match in an imported file", () => {
		sandbox.stub(fs, "readFileSync").returns(`
            it("Does something", () => {
            
            });
        `);
		expect(fn("import \"./somePath.js\"", "", "describe")).to.be.false;
	});

	it("Tests file and match in a nested imported file", () => {
		sandbox.stub(fs, "readFileSync").onFirstCall().returns(`
            import "./someOtherFile.js";
        `);
		fs.readFileSync.onSecondCall().returns(`
            describe("Suite 1 name", function() {
            
            });
            
            describe("Suite 2 name", function() {
            
            });
        `);
		expect(fn("import \"./somePath.js\"", "", "describe")).to.be.true;
	});

	it("Tests function that contains describe in name", () => {
		expect(fn("describeSomething()", "", "describe")).to.be.false;
	});

	it("Tests isTestFile method", () => {
		expect(
			dir.isTestFile("describe('Suite name', function() { })", `${process.cwd()}/something.json`)
		).to.be.false;

		expect(
			dir.isTestFile("describe('Suite name', function() { })", `${process.cwd()}/something.js`)
		).to.be.true;
	});

	afterEach(() => {
		sandbox.restore();
	});
});