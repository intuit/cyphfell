const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");
let plugin = require("../../../src/plugins/ElementIdPlugin");
plugin = new plugin();

describe("Tests ElementId plugin", function() {
    before(() => {
        global.options = {
            transpile: false
        };
    });

    it(`Tests to make sure .ELEMENT attributes are changed`, () => {
        const ast = esprima.generateAST(`const x = () => { let x = xyz.ELEMENT; cy.doSomething(xyz2.something.else.ELEMENT); return test.something.ELEMENT.something.ELEMENT; };`);
        plugin.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(esprima.generateAST(`
            const x = () => {
                let x = xyz;
                cy.doSomething(xyz2.something.else);
                return test.something.something;
            };
        `));
    });

    it("Tests plugin name", () => {
        expect(plugin.getName()).to.be.equal("ElementId");
    });

});