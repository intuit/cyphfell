// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// define custom commands
import "./commands";
import "./frameworkCommands";

const arrays = require("cyphfell/src/CypressArrayUtil.js");
arrays.init();

// keep local storage data after each test
Cypress.LocalStorage.clear = function() {};

// keep cookies after each test
Cypress.Cookies.defaults({
	whitelist: function() {
		return true;
	}
});

// don't crash automation when an application error happens
Cypress.on("uncaught:exception", () => {
	return false;
});

const consoleSpies = [];
const initSpy = (method, win) => {
	consoleSpies.push({level: method.toUpperCase(), spy: cy.spy(win.console, method)});
};

Cypress.on("window:before:load", (win) => {
	consoleSpies.length = 0;
	initSpy("info", win);
	initSpy("error", win);
	initSpy("warn", win);
	initSpy("log", win);
	initSpy("debug", win);
});