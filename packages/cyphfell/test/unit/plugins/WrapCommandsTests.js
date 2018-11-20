const WrapCommandsPlugin = require("../../../src/plugins/WrapElementActionsPlugin");
const esprima = require("../../../src/util/EsprimaUtils");
const _ = require("lodash");

describe("Tests WrapElementActionsPlugin", function() {

	const instance = new WrapCommandsPlugin();

	it("Tests wrapping a command that shouldn't be wrapped", () => {
		const ast = esprima.generateAST(`
            cy.get(".abc").then((abc) => {
                abc.doNotWrap();
            });
        `);
		const copy = _.cloneDeep(ast);
		instance.afterTransformAfterParsing(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests wrapping a command that is not called on an identifier", () => {
		const ast = esprima.generateAST(`
            cy.get(".abc").then((abc) => {
                cy.get(".abc").click();
            });
        `);
		const copy = _.cloneDeep(ast);
		instance.afterTransformAfterParsing(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests attempting to wrap a command that is not inside of a .then() closure", () => {
		const ast = esprima.generateAST("element.click();");
		const copy = _.cloneDeep(ast);
		instance.afterTransformAfterParsing(ast);
		expect(ast).to.deep.equal(copy);
	});

	it("Tests successfully wrapping a command", () => {
		const ast = esprima.generateAST(`cy.get(".abc").then((abc) => {
                abc.click();
            });`);
		instance.afterTransformAfterParsing(ast);
		expect(esprima.regenerateAST(ast)).to.deep.equal(esprima.generateAST("cy.get(\".abc\").click();;"));
	});

	it("Tests successfully wrapping multiple commands", () => {
		const ast = esprima.generateAST(`cy.get(".abc").then((abc) => {
                abc.click();
                abc.waitForVisible();
            });`);
		instance.afterTransformAfterParsing(ast);
		expect(esprima.regenerateAST(ast)).to.deep.equal(esprima.generateAST("cy.get(\".abc\").click().waitForVisible();;"));
	});

	it("Tests successfully wrapping multiple commands with a return", () => {
		const ast = esprima.generateAST(`cy.get(".abc").then((abc) => {
                abc.click();
                abc.waitForVisible();
                return abc.getText();
            });`);
		instance.afterTransformAfterParsing(ast);
		expect(esprima.regenerateAST(ast)).to.deep.equal(esprima.generateAST("cy.get(\".abc\").click().waitForVisible().getText();;"));
	});

	it("Tests attempting to wrap a command with a different identifier than the closure parameter", () => {
		const ast = esprima.generateAST(`cy.get(".abc").then((abc1) => {
                abc.click();
            });`);
		instance.afterTransformAfterParsing(ast);
		expect(ast).to.deep.equal(esprima.generateAST(`
			cy.get(".abc").then((abc1) => {
                cy.wrap(abc).click();
            });
		`));
	});

	it("Tests attempting to wrap isVisible() when starting a chain", () => {
        const ast = esprima.generateAST(`cy.get(".abc").then((abc) => {
        		cy.isVisible(abc);
            });`);
        const copy = _.cloneDeep(ast);
        instance.afterTransformAfterParsing(ast);
        expect(ast).to.deep.equal(copy);
	});

	it("Tests wrapping isVisible() when not starting a chain", () => {
        const ast = esprima.generateAST(`cy.get(".abc").then((abc) => {
        		abc.isVisible();
            });`);
        instance.afterTransformAfterParsing(ast);
        expect(esprima.regenerateAST(ast)).to.deep.equal(esprima.generateAST("cy.get(\".abc\").isVisible();;"));
	});

	it("Tests plugin name", () => {
		expect(instance.getName()).to.be.equal("WrapElementActions");
	});
});