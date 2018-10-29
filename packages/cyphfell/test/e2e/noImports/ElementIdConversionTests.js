const fp = require("../../../src/util/FileParser");
const plugins = require("../../../src/util/PluginsUtil");
const esprima = require("../../../src/util/EsprimaUtils");

describe("Tests ElementId function conversions", function() {

	let pluginsList = null;
	before(() => {
		global.options = {
			cypressFolder: "test/cypress/",
			baseNormalFolder: "test/"
		};
		pluginsList = plugins.loadPlugins("./src/plugins/*");
	});

	it("Tests conversion of the elementIdClick command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    browser.elementIdClick(x.ELEMENT);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").click();
                }
            }
        `));
	});

	it("Tests conversion of the elementIdAttribute command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdAttribute(x.ELEMENT, "id").value).to.be.equal("#test");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdAttribute(x, "id").should((elementIdAttribute1) => {
                            expect(elementIdAttribute1.value).to.be.equal("#test");
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdClear command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    browser.elementIdClear(x.ELEMENT);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").clear();
                }
            }
        `));
	});

	it("Tests conversion of the elementIdCssProperty command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdCssProperty(x.ELEMENT, "display").value).to.be.equal("none");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdCssProperty(x, "display").should((elementIdCssProperty1) => {
                            expect(elementIdCssProperty1.value).to.be.equal("none");
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdDisplayed command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdDisplayed(x.ELEMENT).value).to.be.equal(true);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdDisplayed(x).should((elementIdDisplayed1) => {
                            expect(elementIdDisplayed1.value).to.be.equal(true);
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdElement command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdElement(x.ELEMENT, "div").value).to.be.equal(true);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdElement(x, "div").should((elementIdElement1) => {
                            expect(elementIdElement1.value).to.be.equal(true);
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdElements command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdElements(x.ELEMENT, "div").value.length).to.be.equal(1);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        cy.wrap(x).find("div").should((find1) => {
                            expect(find1.value.length).to.be.equal(1);
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdEnabled command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdEnabled(x.ELEMENT).value).to.be.equal(true);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdEnabled(x).should((elementIdEnabled1) => {
                            expect(elementIdEnabled1.value).to.be.equal(true);
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdLocation command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdLocation(x.ELEMENT).value).to.be.equal({x: 25, y: 55});
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdLocation(x).should((elementIdLocation1) => {
                            expect(elementIdLocation1.value).to.be.equal({x: 25, y: 55});
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdLocationInView command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdLocationInView(x.ELEMENT).value).to.be.equal({x: 25, y: 55});
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdLocationInView(x).should((elementIdLocationInView1) => {
                            expect(elementIdLocationInView1.value).to.be.equal({x: 25, y: 55});
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdName command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdName(x.ELEMENT).value).to.be.equal('div');
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdName(x).should((elementIdName1) => {
                            expect(elementIdName1.value).to.be.equal("div");
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdSelected command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdSelected(x.ELEMENT).value).to.be.equal(true);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdSelected(x).should((elementIdSelected1) => {
                            expect(elementIdSelected1.value).to.be.equal(true);
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdSize command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdSize(x.ELEMENT).value).to.be.equal({width: 25, height: 55});
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdSize(x).should((elementIdSize1) => {
                            expect(elementIdSize1.value).to.be.equal({width: 25, height: 55});
                        });
                    });
                }
            }
        `));
	});

	it("Tests conversion of the elementIdText command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    expect(browser.elementIdText(x.ELEMENT).value).to.be.equal("a");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").should((x) => {
                        browser.elementIdText(x).should((elementIdText1) => {
                            expect(elementIdText1.value).to.be.equal("a");
                        });
                    });
                }
            }
        `));
	});

	// TODO: fix this
	/*it("Tests conversion of the elementIdValue command", () => {
        const res = fp(`
            class X {
                testMethod() {
                    const x = browser.element('.abc');
                    browser.elementIdValue(x.ELEMENT, ["Escape", "Escape"]);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
        expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".abc").then((x) => {
                        cy.wrap(x).type(['Escape', 'Escape'].flat());
                    });
                }
            }
        `));
    });*/

});