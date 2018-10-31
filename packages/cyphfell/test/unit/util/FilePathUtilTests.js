const fp = require("../../../src/util/FilePathUtil");
const sinon = require("sinon");
const fs = require("fs");

describe("Test FilePathUtil module", function() {

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests findPathWithExtension with no matches", () => {
		sandbox.stub(fs, "existsSync").returns(false);
		expect(fp.findPathWithExtension("./test")).to.equal("./test");
	});

	it("Tests findPathWithExtension with inital match", () => {
		sandbox.stub(fs, "existsSync").withArgs("./test").returns(true);
		expect(fp.findPathWithExtension("./test")).to.equal("./test");
	});

	it("Tests findPathWithExtension with .js match", () => {
		sandbox.stub(fs, "existsSync").returns(false);
		fs.existsSync.withArgs("./test.js").returns(true);
		expect(fp.findPathWithExtension("./test")).to.equal("./test.js");
	});

	it("Tests findPathWithExtension with .json match", () => {
		sandbox.stub(fs, "existsSync").returns(false);
		fs.existsSync.withArgs("./test.json").returns(true);
		expect(fp.findPathWithExtension("./test")).to.equal("./test.json");
	});

	it("Tests findLocalFilePath when testing locally", () => {
		process.env.TESTING_LOCALLY = "true";
		expect(fp.findLocalFilePath("defaultFiles/commands.json")).to.be.equal(`${process.cwd()}/defaultFiles/commands.json`);
	});

	it("Tests findLocalFilePath when not testing", () => {
		process.env.TESTING_LOCALLY = "";
		expect(fp.findLocalFilePath("defaultFiles/commands.json")).to.be.equal(`${process.cwd()}/node_modules/cyphfell/defaultFiles/commands.json`);
	});

	it("Tests findAbsolutePathToImport function", () => {
		sandbox.stub(fs, "existsSync").returns(true);
		sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});
		fs.existsSync.withArgs(sinon.match(/test\/something\/node_modules/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/packages\/node_modules/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/test\/something\/test\/file/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/packages\/test/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/test\/something\/@/)).returns(false);
		fs.existsSync.withArgs(sinon.match(`${process.cwd()}/@scope`)).returns(false);
		global.options = {
			baseNormalFolder: "test/",
			moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
			replaceModuleImport: () => {
				return "";
			},
			moduleAliases: []
		};

		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../test.js")).to.be.equal(`${process.cwd()}/test/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./test.js")).to.be.equal(`${process.cwd()}/test/something/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/something/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/something/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "node_modules/@int/moduleName")).to.be.equal(`${process.cwd()}/node_modules/@int/moduleName`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../../otherFolder/test.js")).to.be.equal(`${process.cwd()}/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "node_modules/moduleName")).to.be.equal(`${process.cwd()}/node_modules/moduleName`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "test/file.js")).to.be.equal(`${process.cwd()}/test/file.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "@scopeTest/moduleName")).to.be.equal(`${process.cwd()}/node_modules/@scopeTest/moduleName`);

		// TODO: test with replace module import
	});

	it("Tests findAbsolutePathToImport function with aliasing", () => {
		sandbox.stub(fs, "existsSync").returns(true);
		sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});
		fs.existsSync.withArgs(sinon.match(/test\/something\/node_modules/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/packages\/node_modules/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/test\/something\/test\/file/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/packages\/test/)).returns(false);
		fs.existsSync.withArgs(sinon.match(/test\/something\/@/)).returns(false);
		fs.existsSync.withArgs(sinon.match(`${process.cwd()}/@scope`)).returns(false);
		fs.existsSync.withArgs(sinon.match(`${process.cwd()}/test/file.js`)).returns(false);
		global.options = {
			baseNormalFolder: "test/",
			moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
			replaceModuleImport: () => {
				return "";
			},
			moduleAliases: [{alias: "test", actual: "test252"}]
		};

		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../test.js")).to.be.equal(`${process.cwd()}/test/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./test.js")).to.be.equal(`${process.cwd()}/test/something/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/something/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "./otherFolder/test.js")).to.be.equal(`${process.cwd()}/test/something/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "node_modules/@int/moduleName")).to.be.equal(`${process.cwd()}/node_modules/@int/moduleName`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "../../otherFolder/test.js")).to.be.equal(`${process.cwd()}/otherFolder/test.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "node_modules/moduleName")).to.be.equal(`${process.cwd()}/node_modules/moduleName`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "test/file.js")).to.be.equal(`${process.cwd()}/test252/file.js`);
		expect(fp.findAbsolutePathToImport(`${process.cwd()}/test/something/`, "test/file25.js")).to.be.equal(`${process.cwd()}/test/file25.js`);
	});

	afterEach(() => {
		sandbox.restore();
	});
});