const fp = require("../../../src/util/FileParser");
const plugins = require("../../../src/util/PluginsUtil");
const esprima = require("../../../src/util/EsprimaUtils");

describe("Tests SelectBy function conversions", function() {

	let pluginsList = null;
	before(() => {
		global.options = {
			cypressFolder: "test/cypress/",
			baseNormalFolder: "test/"
		};
		pluginsList = plugins.loadPlugins("./src/plugins/*");
	});

	it("Tests conversion of the selectByAttribute command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    browser.selectByAttribute(".class", "attrb", "val");
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".class").selectByAttribute("attrb", "val");
                }
            }
        `));
	});

	it("Tests conversion of the selectByIndex command", () => {
		const res = fp(`
            class X {
                testMethod() {
                    browser.selectByIndex(".class", 4);
                }
            }
        `, `${process.cwd()}/test/test.js`, global.options, pluginsList);
		expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST(`
            class X {
                testMethod() {
                    cy.get(".class").selectByIndex(4);
                }
            }
        `));
	});
});