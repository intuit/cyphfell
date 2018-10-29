const rewire = require("rewire");
const sinon = require("sinon");
const fs = require("fs");
const converter = require("../../../src/converters/ActiveConverter");

describe("Tests getting the commands to wrap from a file", function() {

	let sandbox = null;
	let commands = null;
	let fn = null;

	before(() => {
		global.options = {};
		commands = rewire("../../../src/constants/CommandsToWrap");
		fn = commands.__get__("customCommands");
	});

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(converter, "getStrategy").returns({
			getCommandsFileContents: () => ""
		});
	});

	it("Tests reading the commands from a file when there are no commands", () => {
		sandbox.stub(fs, "readFileSync").returns("");
		expect(fn()).to.deep.equal([]);
	});

	it("Tests reading the commands from a file when there is 1 command", () => {
		sandbox.stub(fs, "readFileSync").returns(`
            Cypress.Commands.add("getCssProperty", {prevSubject: 'element'}, (subject, cssProperty) => {
                return cy.window().then((window) => {
                    return window.getComputedStyle(subject[0])[cssProperty];
                });
            });
        `);
		expect(fn()).to.deep.equal(["getCssProperty"]);
	});

	it("Tests reading the commands from a file when there are multiple commands and not all should be wrapped", () => {
		sandbox.stub(fs, "readFileSync").returns(`
            Cypress.Commands.add("getCssProperty", {prevSubject: 'element'}, (subject, cssProperty) => {
                return cy.window().then((window) => {
                    return window.getComputedStyle(subject[0])[cssProperty];
                });
            });
        
            Cypress.Commands.add("getHTML", {prevSubject: 'element'}, (subject, outerHTML) => {
                return subject[0][outerHTML ? "outerHTML" : "innerHTML"];
            });
            
            Cypress.Commands.add("getLocation", {prevSubject: 'element'}, (subject, attr) => {
                const rect = subject[0].getBoundingClientRect();
                return cy.window().then((window) => {
                    const coords = {
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY
                    };
                    return attr ? coords[attr] : coords;
                });
            });
           
            Cypress.Commands.add("getRandom", {prevSubject: 'optional'}, (subject, attr) => {
                const rect = subject[0].getBoundingClientRect();
                return cy.window().then((window) => {
                    const coords = {
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY
                    };
                    return attr ? coords[attr] : coords;
                });
            });
            
            Cypress.Commands.add("getSomething", (subject, attr) => {
                const rect = subject[0].getBoundingClientRect();
                return cy.window().then((window) => {
                    const coords = {
                        x: rect.left + window.scrollX,
                        y: rect.top + window.scrollY
                    };
                    return attr ? coords[attr] : coords;
                });
            });
        `);
		expect(fn()).to.deep.equal(["getCssProperty", "getHTML", "getLocation"]);
	});

	it("Tests getting commands to wrap from the current strategy's commands", () => {
		sandbox.stub(fs, "readFileSync").returns("");
		converter.getStrategy.returns({
			getCommandsFileContents: () => `Cypress.Commands.add("getSomethingRandom", {prevSubject: 'element'}, (subject, attr) => {
               return true;
            });`
		});
		expect(fn()).to.deep.equal(["getSomethingRandom"]);
	});

	afterEach(() => {
		sandbox.restore();
	});
});