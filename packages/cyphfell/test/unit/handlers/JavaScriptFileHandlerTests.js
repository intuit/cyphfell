const rewire = require("rewire");
const handler = rewire("../../../src/handlers/JavaScriptFileHandler");
const esprima = require("../../../src/util/EsprimaUtils");
const sinon = require("sinon");
const fs = require("fs");
const WrapElements = require("../../../src/plugins/WrapElementActionsPlugin");
const Wrap = require("../../../src/plugins/WrapReturnsPlugin");
const report = require("../../../src/reports/ReportGenerator");

describe("Tests JavaScriptFileHandler", function() {

	it("Tests transformBrowserExecutes function", () => {
		const fn = handler.__get__("transformBrowserExecutes");
		expect(fn("")).to.be.equal("");
		expect(fn("test")).to.be.equal("test");
		expect(fn("browser.execute().value")).to.be.equal("browser.execute()");
		expect(fn("browser.execute(() => {}).value")).to.be.equal("browser.execute(() => {})");
		expect(fn("browser.execute(() => {xyz.value;}).value")).to.be.equal("browser.execute(() => {xyz.value;})");
		expect(fn("browser.execute(() => {browser.execute().value;}).value")).to.be.equal("browser.execute(() => {browser.execute();})");
	});

	it("Tests canHandle", () => {
		const inst = new handler();
		expect(inst.canHandle(".js")).to.be.true;
		expect(inst.canHandle(".json")).to.be.false;
		expect(inst.canHandle(".extension")).to.be.false;
	});

	describe("Tests transformLine function", function() {

		const inst = new handler();

		it("Tests browser.element() transformation", () => {
			expect(
				inst.transformLine("browser.element('.className')")
			).to.be.equal("cy.get('.className')");
		});

		it("Tests multiple transforms", () => {
			expect(
				inst.transformLine("browser.element('.className'), browser.getValue('.abc')")
			).to.be.equal("cy.get('.className'), cy.get('.abc').invoke(\"val\")");
		});

		it("Tests no transforms", () => {
			expect(
				inst.transformLine("NOTHING_MATCHES")
			).to.be.equal("NOTHING_MATCHES");
		});

		it("Tests error condition", () => {
			sinon.spy(report, "onTransformationError");
			expect(
				inst.transformLine("browser.moveToObject(abc)")
			).to.be.equal("browser.moveToObject(abc)");
			expect(report.onTransformationError.calledOnce).to.be.true;
			report.onTransformationError.restore();
		});
	});

	describe("Tests TransformImports function", function() {

		const inst = new handler();
		let sandbox = null;
		beforeEach(() => {
			sandbox = sinon.createSandbox();
		});

		it("Tests transforming relative import when the cypress folder is outside of baseNormalFolder", () => {
			global.options = {
				baseNormalFolder: "test/",
				cypressFolder: "cypress/",
				moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`]
			};
			const ast = esprima.generateAST("import something from \"./test/file.js\"");
			inst.fileDir = `${process.cwd()}/package.js`;
			inst.newFileDir = `${process.cwd()}/package.js`;

			sandbox.stub(fs, "readFileSync").returns("");
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});
			inst.transformImports(ast);
			expect(ast.body[0].source.value).to.be.equal("./cypress/file.js");
		});

		it("Tests transforming relative import when the cypress folder is inside of baseNormalFolder", () => {
			global.options = {
				baseNormalFolder: "test/",
				cypressFolder: "test/cypress/",
				moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`]
			};
			const ast = esprima.generateAST("import something from \"./test/file.js\"");
			inst.fileDir = `${process.cwd()}/package.js`;
			inst.newFileDir = `${process.cwd()}/package.js`;

			sandbox.stub(fs, "readFileSync").returns("");
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});
			inst.transformImports(ast);
			expect(ast.body[0].source.value).to.be.equal("./test/cypress/file.js");
		});

		it("Tests transforming local file import without a relative specifier", () => {
			global.options = {
				baseNormalFolder: "test/",
				cypressFolder: "test/cypress/",
				moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
				replaceModuleImport: () => ""
			};
			const ast = esprima.generateAST("import something from \"test/file.js\"");
			inst.fileDir = `${process.cwd()}/test/package.js`;
			inst.newFileDir = `${process.cwd()}/test/package.js`;

			sandbox.stub(fs, "readFileSync").returns("");
			sandbox.stub(fs, "existsSync").returns(false);
			fs.existsSync.withArgs(sinon.match(`${process.cwd()}/test/file.js`)).returns(true);
			sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});

			inst.transformImports(ast);
			expect(ast.body[0].source.value).to.be.equal("./cypress/file.js");
		});

		it("Tests transforming a module import", () => {
			const nonTransformedImport = "@cyf/cyphfell";
			global.options = {
				baseNormalFolder: "test/",
				cypressFolder: "cypress/",
				transformModuleImportIntoCypress: (originalImport) => {
					if (originalImport.includes("@cyf/frameworkName")) {
						if (originalImport.includes("@cyf/frameworkName/dist/")) {
							originalImport = originalImport.replace("@cyf/frameworkName/dist/", "@cyf/frameworkName/dist/cypress/");
						} else {
							originalImport = originalImport.replace("@cyf/frameworkName/", "@cyf/frameworkName/dist/cypress/");
						}
					}
					return originalImport;
				},
				moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
				replaceModuleImport: () => "",
				moduleAliases: []
			};
			inst.fileDir = `${process.cwd()}/package.js`;
			inst.newFileDir = `${process.cwd()}/package.js`;
			sandbox.stub(fs, "readFileSync").returns("");
			sandbox.stub(fs, "existsSync").returns(false);
			fs.existsSync.withArgs(sinon.match("node_modules")).returns(true);
			sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});

			const ast = esprima.generateAST(
				`import something from "@cyf/frameworkName/files/TestFile.js";
                 import "@cyf/frameworkName/dist/files/TestFile.js";
                 import "${nonTransformedImport}"`
			);
			inst.transformImports(ast);
			expect(ast.body[0].source.value).to.be.equal("@cyf/frameworkName/dist/cypress/files/TestFile.js");
			expect(ast.body[1].source.value).to.be.equal("@cyf/frameworkName/dist/cypress/files/TestFile.js");
			expect(ast.body[2].source.value).to.be.equal(nonTransformedImport);
		});

		it("Tests transforming a commonjs require statement", () => {
			global.options = {
				baseNormalFolder: "test/",
				cypressFolder: "test/cypress/",
				moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
				replaceModuleImport: () => ""
			};
			const ast = esprima.generateAST("const something = require(\"test/file.js\");");
			inst.fileDir = `${process.cwd()}/test/package.js`;
			inst.newFileDir = `${process.cwd()}/test/package.js`;

			sandbox.stub(fs, "readFileSync").returns("");
			sandbox.stub(fs, "existsSync").returns(false);
			fs.existsSync.withArgs(sinon.match(`${process.cwd()}/test/file.js`)).returns(true);
			sandbox.stub(fs, "lstatSync").returns({isDirectory: () => false});

			inst.transformImports(ast);
			expect(esprima.isRequireStatement(ast.body[0].declarations[0].init)).to.be.equal("./cypress/file.js");
		});

		afterEach(() => {
			sandbox.restore();
		});
	});


	it("Tests plugins being invoked", () => {
		const inst = new handler();
		const plugins = [
			new Wrap(),
			new WrapElements()
		];
		plugins.forEach((plugin) => {
			sinon.stub(plugin, "beforeParseLines");
			sinon.stub(plugin, "afterParseLines");
			sinon.stub(plugin, "beforeTransformAfterParsing");
			sinon.stub(plugin, "afterTransformAfterParsing");
		});
		inst.lines = "";
		inst.newFileDir = "";
		inst.fileDir = "";
		inst.parseImpl(plugins);
		plugins.forEach((plugin) => {
			expect(plugin.beforeParseLines.callCount).to.be.equal(1);
			expect(plugin.afterParseLines.callCount).to.be.equal(1);
			expect(plugin.beforeTransformAfterParsing.callCount).to.be.equal(1);
			expect(plugin.afterTransformAfterParsing.callCount).to.be.equal(1);

			plugin.beforeParseLines.restore();
			plugin.afterParseLines.restore();
			plugin.beforeTransformAfterParsing.restore();
			plugin.afterTransformAfterParsing.restore();
		});
	});
});