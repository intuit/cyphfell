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

const arrays = require("../../../src/CypressArrayUtil.js");
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

// TODO: move the define property into trinityjs
Cypress.on("window:before:load", (win) => {
	Object.defineProperty(win, "self", {
		get: () => {
			return window.top;
		}
	});

	consoleSpies.length = 0;
	initSpy("info", win);
	initSpy("error", win);
	initSpy("warn", win);
	initSpy("log", win);
	initSpy("debug", win);
}); 
 
// initialize global browser object
const initBrowser = require("../../../src/converters/wdio/InitializeBrowserFunctions.js");
initBrowser.init("browser");
Cypress.on("window:load", (win) => {
	initBrowser.initConsoleLog(browser, consoleSpies);
});

// TODO: uncomment this and replace the path to your WDIO config file
//const config = require("wdioConfigFile.js");
//initBrowser.initConfig(browser, config);
        
const hookQueue = [];
const addToQueue = (name, details = {}) => {
	hookQueue.push({
		details: details,
		name: name
	});
};

const commandLog = [];

const config = {
	before: () => {
		addToQueue("before");
	},
	beforeSuite: (suite) => {
		addToQueue("beforeSuite", suite);
	},
	beforeTest: (test) => {
		addToQueue("beforeTest", test);
	},
	afterTest: (test) => {
		addToQueue("afterTest", test);
	},
	afterSuite: (suite) => {
		addToQueue("afterSuite", suite);
	},
	after: () => {
		addToQueue("after");
		try {
			expect(hookQueue[0].name).to.be.equal("before");
			expect(hookQueue[1].name).to.be.equal("beforeSuite");
			expect(hookQueue[1].details.title).to.be.equal("Tests the data capture hooks defined in a config");
			expect(hookQueue[2].name).to.be.equal("beforeTest");
			expect(hookQueue[2].details.title).to.be.equal("Random test 1");
			expect(hookQueue[3].name).to.be.equal("afterTest");
			expect(hookQueue[3].details.title).to.be.equal("Random test 1");
			expect(hookQueue[4].name).to.be.equal("beforeTest");
			expect(hookQueue[4].details.title).to.be.equal("Random test 2");
			expect(hookQueue[5].name).to.be.equal("afterTest");
			expect(hookQueue[5].details.title).to.be.equal("Random test 2");
			expect(hookQueue[6].name).to.be.equal("afterSuite");
			expect(hookQueue[6].details.title).to.be.equal("Tests the data capture hooks defined in a config");

			expect(hookQueue[7].name).to.be.equal("beforeSuite");
			expect(hookQueue[7].details.title).to.be.equal("Tests another test suite");
			expect(hookQueue[8].name).to.be.equal("beforeTest");
			expect(hookQueue[8].details.title).to.be.equal("XYZ");
			expect(hookQueue[9].name).to.be.equal("afterTest");
			expect(hookQueue[9].details.title).to.be.equal("XYZ");
			expect(hookQueue[10].name).to.be.equal("afterSuite");
			expect(hookQueue[10].details.title).to.be.equal("Tests another test suite");

			expect(hookQueue[11].name).to.be.equal("after");
			expect(hookQueue.length).to.be.equal(12);

			// comparing commandLog directly doesn't seem to work, so JSON.parse(JSON.stringify(commandLog)) is used instead
			expect(JSON.parse(JSON.stringify(commandLog))).to.deep.equal([
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "before"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "after"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "before"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "after"
				}
			]);
			expect(commandLog.length).to.be.equal(4);
		} catch (ex) {
			cy.writeFile("test-automation/automationErrors.log", ex.stack);
			throw new Error(ex);
		}
	},
	beforeCommand: (name, args) => {
		commandLog.push({name: name, args: args, type: "before"});
	},
	afterCommand: (name, args) => {
		commandLog.push({name: name, args: args, type: "after"});
	}
};
initBrowser.initConfig(browser, config);