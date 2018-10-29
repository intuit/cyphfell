const rewire = require("rewire");
const esprima = rewire("../../../src/util/EsprimaUtils");
const estraverse = require("estraverse");
const sinon = require("sinon");
const fs = require("fs");
const _ = require("lodash");
const filePathUtil = require("../../../src/util/FilePathUtil");

describe("Tests EsprimaUtils functions", function () {

	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	it("Tests replaceTemporaryStrings function", () => {
		const fn = esprima.__get__("replaceTemporaryStrings"),
			breakSearch = esprima.__get__("LOOP_BREAK"),
			breakReplace = esprima.__get__("REPLACE_LOOP_BREAK"),
			scSearch = esprima.__get__("SUPERCLASS"),
			scReplace = esprima.__get__("REPLACE_SUPERCLASS");

		expect(fn("")).to.be.equal("", "Empty string was not the same");
		expect(fn("Nothing should be replaced in this string")).to.be.equal("Nothing should be replaced in this string", "String was replaced when it shouldn't have been");

		expect(fn(breakSearch)).to.be.equal(breakReplace, "Break statement was not replaced");
		expect(fn(`${breakSearch} -- ${breakSearch}`)).to.be.equal(`${breakReplace} -- ${breakReplace}`, "Multiple break replacements were not made");

		expect(fn(scSearch)).to.be.equal(scReplace, "Superclass statement was not replaced");
		expect(fn(`${scSearch} -- ${scSearch}`)).to.be.equal(`${scReplace} -- ${scReplace}`, "Multiple superclass replacements were not made");

		expect(fn(`${scSearch} / ${scSearch} / ${breakSearch}`)).to.be.equal(`${scReplace} / ${scReplace} / ${breakReplace}`, "Break and superclass were not replaced");
	});

	it("Tests undoReplaceTemporaryStrings function", () => {
		const fn = esprima.__get__("undoReplaceTemporaryStrings"),
			breakSearch = esprima.__get__("LOOP_BREAK"),
			breakReplace = esprima.__get__("REPLACE_LOOP_BREAK"),
			scSearch = esprima.__get__("SUPERCLASS"),
			scReplace = esprima.__get__("REPLACE_SUPERCLASS");

		expect(fn("")).to.be.equal("", "Empty string was not the same");
		expect(fn("Nothing should be replaced in this string")).to.be.equal("Nothing should be replaced in this string", "String was replaced when it shouldn't have been");

		expect(fn(breakReplace)).to.be.equal(breakSearch, "Break statement was not replaced");
		expect(fn(`${breakReplace} -- ${breakReplace}`)).to.be.equal(`${breakSearch} -- ${breakSearch}`, "Multiple break replacements were not made");

		expect(fn(scReplace)).to.be.equal(scSearch, "Superclass statement was not replaced");
		expect(fn(`${scReplace} -- ${scReplace}`)).to.be.equal(`${scSearch} -- ${scSearch}`, "Multiple superclass replacements were not made");

		expect(fn(`${scReplace} / ${scReplace} / ${breakReplace}`)).to.be.equal(`${scSearch} / ${scSearch} / ${breakSearch}`, "Break and superclass were not replaced");
	});

	it("Tests removeExtraSpace function", () => {
		const fn = esprima.__get__("removeExtraSpace");
		expect(fn("")).to.be.equal("");
		expect(fn(" ")).to.be.equal(" ");
		expect(fn("  ")).to.be.equal(" ");
		expect(fn("   ")).to.be.equal(" ");
		expect(fn("                      ")).to.be.equal(" ");
		expect(fn("\n ")).to.be.equal("\n");
	});

	it("Tests findContainingBlock function", () => {
		const fn = esprima.__get__("findContainingBlock");
		const generateAST = (str) => {
			const ast = esprima.generateAST(str).body[0];
			estraverse.traverse(ast, {
				enter: (node, parent) => {
					node.parent = parent;
				}
			});
			return ast;
		};

		const astWithBlock = generateAST("() => { return 25; }");
		expect(fn(astWithBlock.expression.body.body[0])).to.be.equal(astWithBlock.expression.body);

		const ifAST = generateAST("() => { if (true) { return 25; } }");
		expect(fn(ifAST.expression.body.body[0])).to.be.equal(ifAST.expression.body);
		expect(fn(ifAST.expression.body.body[0].consequent.body[0])).to.be.equal(ifAST.expression.body.body[0].consequent);

		const forAST = generateAST("() => { for (let i = 0; i < 25; ++i) { return 25; } }");
		expect(fn(forAST.expression.body.body[0])).to.be.equal(forAST.expression.body);
		expect(fn(forAST.expression.body.body[0].body.body[0])).to.be.equal(forAST.expression.body.body[0].body);

		const whileAST = generateAST("() => { while (true) { const x = 55; } }");
		expect(fn(whileAST.expression.body.body[0])).to.be.equal(whileAST.expression.body);
		expect(fn(whileAST.expression.body.body[0].body.body[0])).to.be.equal(whileAST.expression.body.body[0].body);

		const astNoBlock = generateAST("const x = 25;");
		expect(fn(astNoBlock)).to.not.exist;

		const functionCallAST = generateAST("something.somethingElse().then(somethingElse1 => { return 25; });");
		expect(fn(functionCallAST.expression.arguments[0].body.body[0])).to.be.equal(functionCallAST.expression.arguments[0].body);
	});

	it("Tests simplifyClosures method", () => {
		const fn = esprima.__get__("simplifyClosures");
		const assertUnchanged = (str) => {
			const ast = esprima.generateAST(str);
			estraverse.traverse(ast, {
				enter: (node, parent) => {
					node.parent = parent;
				}
			});
			fn(ast);
			estraverse.traverse(ast, {
				enter: (node) => {
					delete node.parent;
				}
			});
			expect(ast).to.deep.equal(esprima.generateAST(str));
		};

		const assertChanged = (original, newStr) => {
			const ast = esprima.generateAST(original);
			estraverse.traverse(ast, {
				enter: (node, parent) => {
					node.parent = parent;
				}
			});
			fn(ast);
			estraverse.traverse(ast, {
				enter: (node) => {
					delete node.parent;
				}
			});

			try {
				expect(ast).to.deep.equal(esprima.generateAST(newStr));
			} catch (ex) {
				console.log(esprima.generateCodeFromAST(ast));
				throw new Error(ex);
			}
		};

		assertUnchanged("something.somethingElse().then((somethingElse1) => { const x = somethingElse1; return x; });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { const x = somethingElse1; ++x; });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { cy.wrap(somethingElse1); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { new Promise((resolve) => { resolve(somethingElse1); }); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { xyz.funcName().then((funcName1) => { funcName1 + somethingElse1; }); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { const x = 25; const y = somethingElse1; xyz.funcName().then((funcName1) => { funcName1 + y; }); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { const x = 25; xyz.funcName().then((funcName1) => { funcName1 + somethingElse1; }); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { let x = 25; x = somethingElse1; xyz.funcName().then((funcName1) => { funcName1 + x; }); });");
		assertUnchanged("something.somethingElse().then((somethingElse1) => { let x = {val: 25}; x.val = somethingElse1; const copyVar = x.val; xyz.funcName().then((funcName1) => { funcName1 + copyVar; }); });");

		assertChanged("while (true) { something.somethingElse().then((somethingElse1) => { somethingElse1; LoginPage.login(); }); }", " while (true) { something.somethingElse().then(somethingElse1 => { somethingElse1; }); LoginPage.login(); }");
		assertChanged("if (true) { something.somethingElse().then((somethingElse1) => { somethingElse1; LoginPage.login(); SomeOtherClass.methodName().then((methodName1) => { methodName1 }); }); }",
			" if (true) { something.somethingElse().then(somethingElse1 => { somethingElse1; }); LoginPage.login(); SomeOtherClass.methodName().then(methodName1 => { methodName1; }); }");
	});

	it("Tests findTrueImportPath function", () => {
		const fn = esprima.__get__("findTrueImportPath");
		sandbox.stub(fs, "existsSync");
		sandbox.stub(fs, "lstatSync").returns({
			isDirectory: () => false
		});
		fs.existsSync.withArgs("testFile").returns(false);
		fs.existsSync.withArgs("testFile2").returns(false);
		fs.existsSync.withArgs("testFile.js").returns(true);
		fs.existsSync.withArgs("testFile2.json").returns(true);
		fs.existsSync.withArgs("testFile3.js").returns(true);

		expect(fn("testFile")).to.be.equal("testFile.js");
		expect(fn("testFile2")).to.be.equal("testFile2.json");
		expect(fn("testFile3.js")).to.be.equal("testFile3.js");
	});

	it("Tests sanitizeImport method", () => {
		const fn = esprima.__get__("sanitizeImport");
		const old = esprima.__get__("findTrueImportPath");
		esprima.__set__("findTrueImportPath", (path) => {
			if (path === "./currentDirFile") {
				return "./currentDirFile.js";
			} else if (path === "./currentDirJson") {
				return "./currentDirJson.json";
			} else if (path === "test/baseNormalFolderFile") {
				return "test/baseNormalFolderFile.js";
			} else if (path === "./test/commonjsTest") {
				return "./test/commonjsTest.js";
			}
			return path;
		});

		const generateImportAST = (path) => {
			const ast = esprima.generateAST(`import {something} from "${path}";`).body[0];
			fn(ast);
			return ast.source.value;
		};
		const generateRequireAST = (path) => {
			const ast = esprima.generateAST(`const x = require("${path}");`).body[0].declarations[0].init;
			fn(ast, ast.arguments[0].value);
			return ast.arguments[0].value;
		};

		expect(generateImportAST("./currentDirFile")).to.be.equal("./currentDirFile.js");
		expect(generateImportAST("./currentDirJson")).to.be.equal("./currentDirJson.json");
		expect(generateImportAST("./currentDirJson2")).to.be.equal("./currentDirJson2");
		expect(generateRequireAST("./test/commonjsTest")).to.be.equal("./test/commonjsTest.js");
		global.options = {
			baseNormalFolder: "test/"
		};
		expect(generateImportAST("test/baseNormalFolderFile")).to.be.equal("test/baseNormalFolderFile.js");

		esprima.__set__("findTrueImportPath", old);
	});

	it("Tests loadImportMethods function", () => {
		global.options = {
			moduleResolvePaths: []
		};
		sandbox.stub(fs, "existsSync").returns(false);
		sandbox.stub(fs, "readFileSync").returns("");
		sandbox.stub(filePathUtil, "findAbsolutePathToImport").callsFake((path, path2) => {
			return path2.replace("./", "");
		});

		const fn = esprima.__get__("loadImportMethods");
		const old = esprima.__get__("fixSpacing");
		esprima.__set__("fixSpacing", (str) => {
			return str;
		});
		const test = (actual, expected) => {
			expect(esprima.generateAST(actual)).to.deep.equal(esprima.generateAST(expected));
		};

		const testMethod = "static testMethod() { return \"a\"; }";
		const secondMethod = "static secondMethod() { return 25; }";
		const thirdMethod = "static third() { return 55; }";
		const c1method = "static c1method() { if (true) { console.log(5); } }";
		const c3method = "static c3method() { if (true) { console.log(5); } }";
		const scMethod = "static scMethod() { return true; }";
		const scMethodOverridden = "static scMethod() { return false; }";
		const c45method = "c45method() { return true; }";
		const cjsMethod = "cjsMethod() { return false; }";

		fs.readFileSync.withArgs("filePath.js").returns(`
            import SuperClass from "./pathToSc/sc.js";
            import Class1 from "./class1.js";
            import Class2 from "./class2.js";
            import Class45 from "./class45";
            const x = require("./commonjsFile");
            class Test extends SuperClass { 
                ${testMethod}
                ${secondMethod}
            }
            
            class AnotherClass {
                ${thirdMethod}
            }
            
            class MultInheritanceTest extends Aggregation(Class1, Class2, Class45, x) {
            }
        `);
		fs.readFileSync.withArgs("class1.js").returns(`
            class Class1 { 
                ${c1method}
            }
        `);
		fs.readFileSync.withArgs("class2.js").returns(`
            import Class3 from "./class3.js";
            class Class2 extends Class3 {
            }
        `);
		fs.readFileSync.withArgs("class3.js").returns(`
            class Class3 {
                ${c3method}
            }
        `);
		fs.readFileSync.withArgs("pathToSc/sc.js").returns(`
            class SuperClassTest {
                ${scMethod}
            }
        `);
		fs.readFileSync.withArgs("overridingSc.js").returns(`
            import SuperClassTest from "./pathToSc/sc.js";
            class SuperClassOverride extends SuperClassTest {
                ${scMethodOverridden}
            }
        `);
		fs.existsSync.withArgs("class45.js").returns(true);
		fs.readFileSync.withArgs("class45.js").returns(`
            class Class45 {
                ${c45method}
            }
        `);
		fs.existsSync.withArgs("commonjsFile.js").returns(true);
		fs.readFileSync.withArgs("commonjsFile.js").returns(`
            class CommonJSClass {
                ${cjsMethod}
            }
        `);

		const map = new Map();
		fn("filePath.js", map);
		test(map.get("testMethod"), testMethod);
		test(map.get("secondMethod"), secondMethod);
		test(map.get("third"), thirdMethod);
		test(map.get("scMethod"), scMethod);
		test(map.get("c1method"), c1method);
		test(map.get("c3method"), c3method);
		test(map.get("c45method"), c45method);
		test(map.get("cjsMethod"), cjsMethod);
		expect(map.size).to.be.equal(8);

		map.clear();
		fn("class3.js", map);
		test(map.get("c3method"), c3method);
		expect(map.size).to.be.equal(1);

		map.clear();
		fn("overridingSc.js", map);
		expect(map.size).to.be.equal(1);
		test(map.get("scMethod"), scMethodOverridden);

		esprima.__set__("fixSpacing", old);
	});

	describe("Tests formClosure method", function() {

		let fn = null;
		const generateAST = (str) => {
			const ast = esprima.generateAST(str);
			let i = 0;
			estraverse.traverse(ast, {
				enter: (node, parent) => {
					node.parent = parent;
					node.index = i++;
				}
			});
			return ast;
		};
		const resetTraversalProps = (ast) => {
			estraverse.traverse(ast, {
				enter: (node) => {
					delete node.parent;
					delete node.index;
					delete node.bodyIndex;
					delete node.visited;
				}
			});
		};
		const assertSame = (ast, copy) => {
			resetTraversalProps(ast);
			resetTraversalProps(copy);
			expect(ast).to.deep.equal(copy);
		};

		before(() => {
			fn = esprima.__get__("formClosure");
		});

		it("Tests call as only expression in body", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    xyz.funcName();
                };
            `);
			const copy = _.cloneDeep(ast);
			fn(ast.body[0].declarations[0].init.body.body[0].expression, new Map(), filterCallback, new Map());
			assertSame(ast, copy);
		});

		it("Tests something after call in same body", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    xyz.funcName();
                    another.func();
                };
            `);
			fn(ast.body[0].declarations[0].init.body.body[0].expression, new Map(), filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                xyz.funcName().then(funcName1 => {
                    funcName1;
                    another.func();
                });
            };`));
		});

		it("Tests variable declaration", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    const res = xyz.funcName();
                    another.func(res);
                };
            `);
			fn(ast.body[0].declarations[0].init.body.body[0].declarations[0].init, new Map(), filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                xyz.funcName().then(funcName1 => {
                    const res = funcName1;
                    another.func(res);
                });
            };`));
		});

		it("Tests while loop", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    while (true) {
                        const res = xyz.funcName();
                        another.func(res);
                    }
                };
            `);
			fn(ast.body[0].declarations[0].init.body.body[0].body.body[0].declarations[0].init, new Map(), filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                while (true) {
                    xyz.funcName().then(funcName1 => {
                        const res = funcName1;
                        another.func(res);
                    });
                }
            };`));
		});

		it("Tests for loop", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    for (const i = 0; i < 25; ++i) {
                        const res = xyz.funcName();
                        another.func(res);
                    }
                };
            `);
			fn(ast.body[0].declarations[0].init.body.body[0].body.body[0].declarations[0].init, new Map(), filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                for (const i = 0; i < 25; ++i) {
                    xyz.funcName().then(funcName1 => {
                        const res = funcName1;
                        another.func(res);
                    });
                }
            };`));
		});

		it("Tests browser element variable declaration", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    const test = cy.get();
                    another.func(test);
                };
            `);
			fn(ast.body[0].declarations[0].init.body.body[0].declarations[0].init, new Map(), filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                cy.get().then(get1 => {
                    const test = get1;
                    another.func(test);
                });
            };`));
		});

		it("Tests return statement preservation", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    const argget1 = cy.get();
                    return another.func(argget1);
                };
            `);

			fn(ast.body[0].declarations[0].init.body.body[0].declarations[0].init, new Map(), filterCallback, new Map());
			expect(esprima.generateAST(esprima.generateCodeFromAST(ast))).to.deep.equal(esprima.generateAST(`const x = () => {
                return cy.get().then(get1 => {
                    const argget1 = get1;
                    return another.func(argget1);
                });;
            };`));
		});

		it("Tests then parameter naming", () => {
			const filterCallback = () => true;
			const ast = generateAST(`
                const x = () => {
                    const test = cy.get();
                    another.func(test);
                };
            `);
			const varNameMap = new Map();
			varNameMap.set("get", 26);
			varNameMap.set("somethingElse", 5000);
			fn(ast.body[0].declarations[0].init.body.body[0].declarations[0].init, varNameMap, filterCallback, new Map());
			resetTraversalProps(ast);
			expect(ast).to.deep.equal(esprima.generateAST(`const x = () => {
                cy.get().then(get26 => {
                    const test = get26;
                    another.func(test);
                });
            };`));
		});

		it("Tests doing nothing if filter function returns false", () => {
			const filterCallback = () => false;
			const ast = generateAST(`
                const x = () => {
                    functionTest.name(25);
                };
            `);
			const copy = _.cloneDeep(ast);
			fn(ast.body[0].declarations[0].init.body.body[0].expression, new Map(), filterCallback, new Map());
			expect(ast).to.deep.equal(copy);
		});

	});

	describe("Tests getImportSourceCode", function() {

		beforeEach(() => {
			global.options = {
				baseNormalFolder: "test/",
				replaceModuleImport: (arg) => arg
			};

			sandbox.stub(filePathUtil, "findAbsolutePathToImport").callsFake((path, path2) => {
				let res = path2.replace("./", "");
				if (!res.endsWith(".js")) {
					return `${res}.js`;
				}
				return res;
			});
		});

		it("Tests with no imports", () => {
			const res = esprima.getImportSourceCode("class Test { method() { return true; } }", "ClassName", "methodName", "./nowhere.js", new Map());
			expect(res).to.be.equal("");
		});

		it("Tests with no matching imports", () => {
			const res = esprima.getImportSourceCode("import Class2 from \"./somewhere.js\"; class Test { method() { return true; } }", "ClassName", "methodName", "./nowhere.js", new Map());
			expect(res).to.be.equal("");
		});

		it("Tests with a matching import but no matching function", () => {
			global.options = {
				moduleResolvePaths: []
			};
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("import Class2 from \"./somewhere.js\"; class Test { method() { return true; } }", "Class2", "methodName", "./nowhere.js", new Map());
			expect(res).to.be.equal("");
		});

		it("Tests with a matching import and matching function", () => {
			global.options = {
				moduleResolvePaths: []
			};
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("import Class2 from \"./somewhere.js\"; class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests with a matching import and matching function with no extension at end of path", () => {
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("import Class2 from \"./somewhere\"; class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests with a matching import and matching function where import starts with baseNormalFolder", () => {
			sandbox.stub(fs, "readFileSync").returns("");
			fs.readFileSync.withArgs("test/somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("import Class2 from \"test/somewhere.js\"; class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests with a matching import and matching function where import is from node_modules", () => {
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.returns("");
			fs.readFileSync.withArgs("someModule/somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("import Class2 from \"someModule/somewhere.js\"; class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests attempting to import json", () => {
			sandbox.stub(fs, "readFileSync").returns("");
			let map = new Map();
			expect(
				esprima.getImportSourceCode("import Class2 from \"./somewhere.json\"; class Test { method() { return true; } }", "Class2", "methodName", "./nowhere.js", map)
			).to.be.equal("");
			expect(map.size).to.be.equal(0, "JSON flow was not followed, because an import was added to the map");

			expect(
				esprima.getImportSourceCode("import Class2 from \"./somewhere\"; class Test { method() { return true; } }", "Class2", "methodName", "./nowhere.js", map)
			).to.be.equal("");
		});

		it("Tests with matching import already in map", () => {
			const map = new Map();
			const innerMap = new Map();
			map.set("somewhere.js", innerMap);
			innerMap.set("methodName", "() => true;");
			const res = esprima.getImportSourceCode("import Class2 from \"./somewhere.js\"; class Test { method() { return true; } }", "Class2", "methodName", "./nowhere.js", map);
			expect(res).to.be.equal("() => true;");
		});

		it("Tests with multiple specifiers", () => {
			const map = new Map();
			const innerMap = new Map();
			map.set("somewhere.js", innerMap);
			innerMap.set("methodName", "() => true;");
			const res = esprima.getImportSourceCode("import {Class2, Class3} from \"./somewhere.js\"; class Test { method() { return true; } }", "Class2", "methodName", "./nowhere.js", map);
			expect(res).to.be.equal("() => true;");
		});

		it("Tests with commonjs require", () => {
			global.options = {
				moduleResolvePaths: []
			};
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("const Class2 = require(\"./somewhere.js\"); class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests with commonjs require when the class is not the first declarator", () => {
			global.options = {
				moduleResolvePaths: []
			};
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("const Class55555 = 'abc', Class2 = require(\"./somewhere.js\"); class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res.replace(/\s/g, "")).to.be.equal(`
                testMethod() {
                    return false;
                }`.replace(/\s/g, ""));
		});

		it("Tests with commonjs require when there is no require", () => {
			global.options = {
				moduleResolvePaths: []
			};
			sandbox.stub(fs, "readFileSync");
			fs.readFileSync.withArgs("somewhere.js").returns(`
                class Class2 {
                    testMethod() {
                        return false;
                    }
                }
            `);
			const res = esprima.getImportSourceCode("const Class55555 = 'abc'; class Test { method() { return true; } }", "Class2", "testMethod", "./nowhere.js", new Map());
			expect(res).to.be.equal("");
		});
	});

	describe("Tests getFunctionSource function", function () {
		it("Tests with no matching function", () => {
			expect(
				esprima.getFunctionSource(`
                    class SomeClass {
                        method() {
                            return true;
                        }
                    }
                `, "NotAFunction")
			).to.be.equal("");
		});

		it("Tests with a matching function", () => {
			expect(
				esprima.getFunctionSource(`
                    class SomeClass {
                        method() {
                            return true;
                        }
                    }
                `, "method").replace(/\s/g, "")
			).to.be.equal("method() { return true; }".replace(/\s/g, ""));
		});

		it("Tests with multiple matching functions", () => {
			expect(
				esprima.getFunctionSource(`
                    class SomeClass {
                        method() {
                            return true;
                        }
                        
                        method() {
                            return false;
                        }
                    }
                `, "method").replace(/\s/g, "")
			).to.be.equal("method() { return false; }".replace(/\s/g, ""));
		});
	});

	afterEach(() => {
		sandbox.restore();
	});
});