const rewire = require("rewire");
const ReportGenerator = rewire("../../../src/reports/ReportGenerator");
const sinon = require("sinon");
const fs = require("fs-extra");
const esprima = require("esprima");
const estraverse = require("estraverse");

describe("Tests ReportGeneration functions", function() {

	let sandbox = null;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests getConfigToWrite function", () => {
		global.options = {
			testArray: ["abc"],
			testFunction: function() {console.log("this is a test function");},
			testValue: 25,
			StringTEST: "this is a test string",
			objectArray: [
				{
					prop1: "abc",
					prop2: "abcdefg"
				},
				{
					prop1: "test",
					prop2: "test2"
				}
			]
		};
		const fn = ReportGenerator.__get__("getConfigToWrite");
		const result = fn([{getName: () => "pluginTestName"}]);
		expect(result).to.deep.equal([{
			name: "testArray",
			value: ["abc"]
		}, {
			name: "testFunction",
			isFunctionDefinition: true,
			value: `function () {console.log("this is a test function");}`
		}, {
			name: "testValue",
			value: 25
		}, {
			name: "StringTEST",
			value: "this is a test string"
		}, {
			name: "objectArray",
			value: [JSON.stringify(options.objectArray[0]), JSON.stringify(options.objectArray[1])]
		}, {
			name: "plugins",
			value: ["pluginTestName"]
		}]);
	});

	it("Tests onFileStart", () => {
		expect(ReportGenerator.files).to.deep.equal([]);
		ReportGenerator.onFileStart("./test.js", "./newPath.js");
		expect(ReportGenerator.files).to.deep.equal([
			{
				path: "./test.js",
				criticalError: null,
				warnings: [],
				lineErrors: [],
				newPath: "./newPath.js"
			}
		]);
		ReportGenerator.reset();
	});

	it("Tests reset method", () => {
		ReportGenerator.onFileStart("./test.js");
		ReportGenerator.reset();
		expect(ReportGenerator.files).to.deep.equal([]);
	});

	it("Tests onTransformationError", () => {
		ReportGenerator.onFileStart("./test.js", "newPath");
		ReportGenerator.onTransformationError("Error message", "const x = true;");
		ReportGenerator.onTransformationError("Error message 2", "const y = true;");
		expect(ReportGenerator.files).to.deep.equal([{
			path: "./test.js",
			criticalError: null,
			warnings: [],
			lineErrors: [{
				line: "const x = true;",
				message: "Error message"
			}, {
				line: "const y = true;",
				message: "Error message 2"
			}],
			newPath: "newPath"
		}]);
		ReportGenerator.reset();
	});

	it("Tests onCriticalError", () => {
		const stackTrace = "New error happened \n \n \n \n\nstuffstuffstuf" +
            "stuffstuffstuffstuffstuffstuffstuffstuffstuff\n" +
            "stuffstuffstuffstuffstuffstuffstuffstuff" +
            "stuffstuffstuffstuffstuffstuff" +
            "stuffstuffstuffstuffstuffstufffstuffstuffstuffstuffstuffstuffstuffstuff\n";
		expect(ReportGenerator.files).to.deep.equal([]);
		ReportGenerator.onFileStart("./test.js", "newPath");
		ReportGenerator.onCriticalError(stackTrace);
		expect(ReportGenerator.files).to.deep.equal([
			{
				path: "./test.js",
				criticalError: stackTrace,
				warnings: [],
				lineErrors: [],
				newPath: "newPath"
			}
		]);
		ReportGenerator.reset();
	});

	it("Tests onWarning", () => {
		ReportGenerator.onFileStart("./test.js", "./newPathStart.js");
		ReportGenerator.onWarning("Error message", "const x = true;", 5);
		ReportGenerator.onWarning("Error message 2", "const y = true;", 9);
		expect(ReportGenerator.files).to.deep.equal([{
			path: "./test.js",
			criticalError: null,
			warnings: [{
				code: "const x = true;",
				message: "Error message",
				lineNumber: 5
			}, {
				code: "const y = true;",
				message: "Error message 2",
				lineNumber: 9
			}],
			lineErrors: [],
			newPath: "./newPathStart.js"
		}]);
		ReportGenerator.reset();
	});

	it("Tests generateReport with no files parsed", () => {
		global.options = {
			reportOutputFolder: "cyphfell-output"
		};
		sandbox.stub(fs, "mkdirsSync");
		sandbox.stub(fs, "writeFileSync");
		ReportGenerator.generateReport([]);
		expect(fs.mkdirsSync.calledOnce).to.be.true;
		expect(fs.mkdirsSync.getCall(0).args[0]).to.be.equal(`${process.cwd()}/cyphfell-output`);
		expect(fs.writeFileSync.calledOnce).to.be.true;

		const output = fs.writeFileSync.getCall(0).args[1];
		expect(output).to.include("const SUCCESSFULLY_TRANSFORMED = 0,");
		expect(output).to.include("CRITICAL_FAILURES_COUNT = 0,");
		expect(output).to.include("TRANSFORM_WARNINGS_COUNT = 0,");
		expect(output).to.include("TRANSFORM_FAILURES_COUNT = 0;");
		expect(output).to.include("const CRITICAL_FAILURES = []");
		expect(output).to.include("const LINE_TRANSFORMATION_ERRORS = []");
		expect(output).to.include("const TRANSFORMATION_WARNINGS = []");
		expect(output).to.not.include("CONFIG-PROPS-TEMPLATE");
		expect(output).to.not.include("CYPHFELL-VERSION-TEMPLATE");
		ReportGenerator.reset();
	});

	it("Tests generateReport with files parsed", () => {
		global.options = {
			reportOutputFolder: "cyphfell-output"
		};
		sandbox.stub(fs, "mkdirsSync");
		sandbox.stub(fs, "writeFileSync");
		ReportGenerator.onFileStart("./test.js");
		ReportGenerator.onTransformationError("Test err", "const x = true;");
		ReportGenerator.onTransformationError("Test err2", "const y = true;");
		ReportGenerator.onTransformationError("Test err3", "const x2 = true;");
		ReportGenerator.onWarning("Warning msg", "const y = true;");
		ReportGenerator.onWarning("Warning msg2", "const y = true;");
		ReportGenerator.onFileStart("./test2.js");
		ReportGenerator.onCriticalError("stackTrace");
		ReportGenerator.onFileStart("./test2.js");
		ReportGenerator.onFileStart("./test3.js");
		ReportGenerator.onFileStart("./test4.js");
		ReportGenerator.generateReport([]);

		expect(fs.mkdirsSync.calledOnce).to.be.true;
		expect(fs.mkdirsSync.getCall(0).args[0]).to.be.equal(`${process.cwd()}/cyphfell-output`);
		expect(fs.writeFileSync.calledOnce).to.be.true;

		const output = fs.writeFileSync.getCall(0).args[1];
		expect(output).to.include("const SUCCESSFULLY_TRANSFORMED = 4,");
		expect(output).to.include("CRITICAL_FAILURES_COUNT = 1,");
		expect(output).to.include("TRANSFORM_WARNINGS_COUNT = 2,");
		expect(output).to.include("TRANSFORM_FAILURES_COUNT = 3;");
		expect(output).to.not.include("CONFIG-PROPS-TEMPLATE");
		expect(output).to.not.include("CYPHFELL-VERSION-TEMPLATE");
		const ast = esprima.parse(output.split("<script type=\"text/babel\">")[1].split("</script>")[0], {sourceType: "module", jsx: true});

		let visitedCritFailures = false,
			visitedLineTransformations = false,
			visitedTransformationWarnings = false;
		try {
			estraverse.traverse(ast, {
				enter: (node) => {
					if (node.type === "VariableDeclarator") {
						if (node.id.name === "CRITICAL_FAILURES") {
							expect(node.init).to.deep.equal({
								"type": "ArrayExpression",
								"elements": [
									{
										"type": "ObjectExpression",
										"properties": [
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "filePath",
													"raw": "\"filePath\""
												},
												"computed": false,
												"value": {
													"type": "Literal",
													"value": "./test2.js",
													"raw": "\"./test2.js\""
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											},
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "stackTrace",
													"raw": "\"stackTrace\""
												},
												"computed": false,
												"value": {
													"type": "Literal",
													"value": "stackTrace",
													"raw": "\"stackTrace\""
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											}
										]
									}
								]
							});
							visitedCritFailures = true;
						} else if (node.id.name === "LINE_TRANSFORMATION_ERRORS") {
							expect(node.init).to.deep.equal({
								"type": "ArrayExpression",
								"elements": [
									{
										"type": "ObjectExpression",
										"properties": [
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "filePath",
													"raw": "\"filePath\""
												},
												"computed": false,
												"value": {
													"type": "Literal",
													"value": "./test.js",
													"raw": "\"./test.js\""
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											},
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "errors",
													"raw": "\"errors\""
												},
												"computed": false,
												"value": {
													"type": "ArrayExpression",
													"elements": [
														{
															"type": "ObjectExpression",
															"properties": [
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "line",
																		"raw": "\"line\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "const x = true;",
																		"raw": "\"const x = true;\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																},
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "message",
																		"raw": "\"message\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "Test err",
																		"raw": "\"Test err\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																}
															]
														},
														{
															"type": "ObjectExpression",
															"properties": [
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "line",
																		"raw": "\"line\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "const y = true;",
																		"raw": "\"const y = true;\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																},
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "message",
																		"raw": "\"message\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "Test err2",
																		"raw": "\"Test err2\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																}
															]
														},
														{
															"type": "ObjectExpression",
															"properties": [
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "line",
																		"raw": "\"line\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "const x2 = true;",
																		"raw": "\"const x2 = true;\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																},
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "message",
																		"raw": "\"message\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "Test err3",
																		"raw": "\"Test err3\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																}
															]
														}
													]
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											}
										]
									}
								]
							});
							visitedLineTransformations = true;
						} else if (node.id.name === "TRANSFORMATION_WARNINGS") {
							visitedTransformationWarnings = true;
							expect(node.init).to.deep.equal({
								"type": "ArrayExpression",
								"elements": [
									{
										"type": "ObjectExpression",
										"properties": [
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "filePath",
													"raw": "\"filePath\""
												},
												"computed": false,
												"value": {
													"type": "Literal",
													"value": "./test.js",
													"raw": "\"./test.js\""
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											},
											{
												"type": "Property",
												"key": {
													"type": "Literal",
													"value": "warnings",
													"raw": "\"warnings\""
												},
												"computed": false,
												"value": {
													"type": "ArrayExpression",
													"elements": [
														{
															"type": "ObjectExpression",
															"properties": [
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "code",
																		"raw": "\"code\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "const y = true;",
																		"raw": "\"const y = true;\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																},
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "message",
																		"raw": "\"message\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "Warning msg",
																		"raw": "\"Warning msg\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																}
															]
														},
														{
															"type": "ObjectExpression",
															"properties": [
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "code",
																		"raw": "\"code\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "const y = true;",
																		"raw": "\"const y = true;\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																},
																{
																	"type": "Property",
																	"key": {
																		"type": "Literal",
																		"value": "message",
																		"raw": "\"message\""
																	},
																	"computed": false,
																	"value": {
																		"type": "Literal",
																		"value": "Warning msg2",
																		"raw": "\"Warning msg2\""
																	},
																	"kind": "init",
																	"method": false,
																	"shorthand": false
																}
															]
														}
													]
												},
												"kind": "init",
												"method": false,
												"shorthand": false
											}
										]
									}
								]
							});
						}
					}
				}
			});
		} catch (ex) {
			// fix not being able to walk over JSX
			if (!ex.stack.includes("JSXElement")) {
				throw new Error(ex);
			}
		}
		expect(visitedCritFailures).to.be.true;
		expect(visitedLineTransformations).to.be.true;
		expect(visitedTransformationWarnings).to.be.true;
		ReportGenerator.reset();
	});

	afterEach(() => {
		sandbox.restore();
	});
});