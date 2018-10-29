const fp = require("../../../src/util/FileParser");
const plugins = require("../../../src/util/PluginsUtil");
const esprima = require("../../../src/util/EsprimaUtils");

describe("e2e tests with no imports", function () {

	let pluginsList = null;
	before(() => {
		global.options = {
			cypressFolder: "test/cypress/",
			baseNormalFolder: "test/"
		};
		pluginsList = plugins.loadPlugins("./src/plugins/*");
	});

	it("Tests browser.elements()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    return browser.elements(".abc");
                }
                
                method1() {
                    return browser.elements(".abc").value.map((element) => {
                        return element.element(".xyz");
                    });
                }
                
                method2() {
                    return browser.elements(".abc").value;
                }
                
                method3() {
                    return browser.elements(".abc").value.forEach((element) => {
                        element.click();
                    });
                }
                
                method4() {
                    const x = browser.elements(".abc");
                    return x.value.filter((element) => {
                        return cy.isVisible(element);
                    });
                }
                
                method5() {
                	const x = browser.elements(".abc");
                    return x.value.filter((element) => {
                        return true;
                    });
                }
                
                method6() {
                	return browser.elements(".abc").value[0].elements("div");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.getAllWDIO(".abc");
                }
                
                method1() {
                    return cy.getAll(".abc").then(getAll1 => {
                        return getAll1.mapCypress(element => {
                            return cy.wrap(element).findFirst(".xyz");
                        });
                    });
                }
                
                method2() {
                    return cy.getAll(".abc");
                }
                
                method3() {
                    return cy.getAll(".abc").then(getAll3 => {
                        return getAll3.forEach(element => {
                            cy.wrap(element).click();
                        });
                    });
                }
                
                method4() {
                    return cy.getAllWDIO(".abc").then(x => {
                        return x.value.filterCypress((element) => {
                            return cy.isVisible(element);
                        });
                    });
                }
                
                method5() {
                	return cy.getAllWDIO(".abc").then(x => {
                        return x.value.filter((element) => {
                            return true;
                        });
                    });
                }
                
                method6() {
                	return cy.getAll(".abc").then(getAll4 => {
                		return cy.wrap(getAll4[0]).findSubElements("div");
                	});
                }
            }
        `));
	});

	it("Tests browser.element()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    return browser.element(".abc");
                }

                method1() {
                    return this.testMethod().click();
                }

                method2() {
                    const x = this.testMethod();
                    x.click();
                }
                
                method3() {
                    return this.testMethod().isSelected();
                }
                
                method4() {
                	return browser.element(".abc").click();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc");
                }

                method1() {
                    return this.testMethod().click();
                }

                method2() {
                    this.testMethod().click();
                }
                
                method3() {
                    return this.testMethod().isSelected();
                }
                
                method4() {
                    return cy.get(".abc").click();
                }
            }
        `));
	});

	it("Tests browser.log()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    return browser.log(".abc").value;
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return browser.log(".abc").then((log1) => {
                    	return log1.value;
                    });
                }
            }
        `));
	});

	it("Tests promise chain in a member function after the calling member function", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = this.test2();
                    return x;
                }
                
                test2() {
                	return browser.element(".abc").getText();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return this.test2().then((x) => {
                    	return x;
                    });
                }
                
                test2() {
                	return cy.get(".abc").getText();
                }
            }
        `));
	});

	it("Tests browser.getLocation()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getLocation(".abc");
                    return browser.element(".abc").getLocation();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getLocation().then((x) => {
                		return cy.get(".abc").getLocation();
                	});
                }
            }
        `));
	});

	it("Tests browser.getHTML()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getHTML(".abc");
                    return browser.element(".abc").getHTML();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getHTML(true).then((x) => {
                		return cy.get(".abc").getHTML(true);
                	});
                }
            }
        `));
	});

	it("Tests browser.click()", () => {
		const res = fp(`
            class X {
                testMethod() {
                	browser.click(".abc");
                	browser.element(".abc").click();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").click();
                	cy.get(".abc").click();
                }
            }
        `));
	});

	it("Tests browser.setValue()", () => {
		const res = fp(`
            class X {
                testMethod() {
                	browser.setValue(".abc", "abc2");
                	browser.element(".abc").setValue("abc2");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").setValue("abc2");
                	cy.get(".abc").setValue("abc2");
                }
            }
        `));
	});

	it("Tests browser.getAttribute()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getAttribute(".abc", "id");
                    return browser.element(".abc").getAttribute("id");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getAttribute("id").then((x) => {
                		return cy.get(".abc").getAttribute("id");
                	});
                }
            }
        `));
	});

	it("Tests browser.getCssProperty()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getCssProperty(".abc", "id");
                    return browser.element(".abc").getCssProperty("id");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getCssProperty("id").then((x) => {
                		return cy.get(".abc").getCssProperty("id");
                	});
                }
            }
        `));
	});

	it("Tests browser.getElementSize()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getElementSize(".abc", "x");
                    return browser.element(".abc").getElementSize("x");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getElementSize("x").then((x) => {
                		return cy.get(".abc").getElementSize("x");
                	});
                }
            }
        `));
	});

	it("Tests browser.getLocationInView()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getLocationInView(".abc");
                    return browser.element(".abc").getLocationInView();
                }
                
                withParam() {
                	const x = browser.getLocationInView(".abc", "x");
                    return browser.element(".abc").getLocationInView("x");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getLocationInView().then((x) => {
                		return cy.get(".abc").getLocationInView();
                	});
                }
                
                withParam() {
                	 return cy.get(".abc").getLocationInView("x").then((x) => {
                		return cy.get(".abc").getLocationInView("x");
                	});
                }
            }
        `));
	});

	it("Tests browser.getTagName()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.getTagName(".abc");
                    return browser.element(".abc").getTagName();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").getTagName().then((x) => {
                		return cy.get(".abc").getTagName();
                	});
                }
            }
        `));
	});

	it("Tests browser.hasFocus()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.hasFocus(".abc");
                    return browser.element(".abc").hasFocus();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").hasFocus().then((x) => {
                		return cy.get(".abc").hasFocus();
                	});
                }
            }
        `));
	});

	it("Tests browser.isEnabled()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.isEnabled(".abc");
                    return browser.element(".abc").isEnabled();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").isEnabled().then((x) => {
                		return cy.get(".abc").isEnabled();
                	});
                }
            }
        `));
	});

	it("Tests browser.isExisting()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.isExisting(".abc");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.isExisting(".abc").should((x) => {
                	});
                }
            }
        `));
	});

	it("Tests browser.isSelected()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.isSelected(".abc");
                    return browser.element(".abc").isSelected();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.get(".abc").isSelected().then((x) => {
                		return cy.get(".abc").isSelected();
                	});
                }
            }
        `));
	});

	it("Tests browser.isVisible()", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.isVisible(".abc");
                    return browser.element(".abc").isVisible();
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    return cy.isVisible(".abc").then((x) => {
                		return cy.get(".abc").isVisible();
                	});
                }
            }
        `));
	});

	it("Tests browser.addValue()", () => {
		const res = fp(`
            class X {
                testMethod() {
                	browser.addValue(".abc", "abc2");
                	browser.element(".abc").addValue("abc2");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").addValue("abc2");
                	cy.get(".abc").addValue("abc2");
                }
            }
        `));
	});
});