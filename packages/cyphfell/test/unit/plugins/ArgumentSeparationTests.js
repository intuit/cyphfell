const esprima = require("../../../src/util/EsprimaUtils");
let plugin = require("../../../src/plugins/ArgumentSeparationPlugin");
plugin = new plugin();

const assertEqual = (ast, expectedString) => {
	const newAST = esprima.generateAST(esprima.generateCodeFromAST(ast));
	expect(newAST).to.deep.equal(esprima.generateAST(expectedString));
};

describe("Tests ArgumentSeparation plugin", function() {

	before(() => {
		global.options = {
			transpile: false
		};
	});

	it("Tests single argument", () => {
		const ast = esprima.generateAST(`
                const x = () => {
                    another.func(cy.get());
                };
            `);
		plugin.beforeParseLines(ast);
		assertEqual(ast, `const x = () => {
            const argget1 = cy.get();
            another.func(argget1);
        };`);
	});

	it("Tests multiple arguments", () => {
		const ast = esprima.generateAST(`
                const x = () => {
                    another.func(cy.get(), cy.get("SOMETHING"));
                };
            `);
		plugin.beforeParseLines(ast);
		assertEqual(ast, `const x = () => {
            const argget1 = cy.get();
            const argget2 = cy.get("SOMETHING");
            another.func(argget1, argget2);
        };`);
	});

	it("Tests not being the first node in the body", () => {
		const ast = esprima.generateAST(`
                const x = () => {
                    doNothing.nothingHere();
                    another.func(cy.get(), cy.get("SOMETHING"));
                };
            `);
		plugin.beforeParseLines(ast);
		assertEqual(ast, `const x = () => {
            doNothing.nothingHere();
            const argget1 = cy.get();
            const argget2 = cy.get("SOMETHING");
            another.func(argget1, argget2);
        };`);
	});

	it("Tests multiple separations in same block", () => {
		const ast = esprima.generateAST(`
                const x = () => {
                    const xyz = 25;
                    doNothing.funcName(cy.getText(".val"));
                    another.func(cy.get(), cy.get("SOMETHING"));
                };
            `);
		plugin.beforeParseLines(ast);
		assertEqual(ast, `const x = () => {
            const xyz = 25;
            const arggetText1 = cy.getText(".val");
            doNothing.funcName(arggetText1);
            const argget1 = cy.get();
            const argget2 = cy.get("SOMETHING");
            another.func(argget1, argget2);
        };`);
	});

	it("Tests ArgumentSeparation plugin name", () => {
		expect(plugin.getName()).to.be.equal("ArgumentSeparation");
	});
});