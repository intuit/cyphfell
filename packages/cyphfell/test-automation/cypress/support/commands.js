// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const validator = require("css-what");

Cypress.Commands.overwrite("get", (originalFn, selector, options) => {
	try {
		validator(selector);
	} catch (ex) {
		return cy.document().then((document) => {
			return cy.wrap(document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue).should("not.be.null").then((el) => {
				return cy.wrap(el);
			});
		});
	}

	if (options && options.multiple) {
		const array = [];
		return cy.wrap(originalFn(selector, options)).each((res) => {
			array.push(res);
		}).then(() => {
			return array;
		});
	} else {
		return cy.wrap(originalFn(selector, options)).first();
	}
});

Cypress.Commands.add("getAll", (selector, options = {}) => {
	return cy.get(selector, Object.assign(options, {multiple: true}));
});

Cypress.Commands.add("findFirst", {prevSubject: "element"}, (subject, selector) => {
	return cy.wrap(subject).find(selector).then((res) => {
		return cy.wrap(res[0]);
	});
});
