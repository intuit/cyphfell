const BaseStrategy = require("../BaseStrategy");
const wdioReplacements = require("./WDIORegexReplacements");
const baseTransformedReturns = require("../../regex/ReverseReturnRegex");
const temp = require("./TemporaryRegexReplacements");
const fpUtil = require("../../util/FilePathUtil");
const name = require("../../constants/FrameworkConstants").WebdriverIO;

class WDIOStrategy extends BaseStrategy {

	/**
     * Gets a list of all regular expressions to replace, and what to replace them with
     * @return {Array<String>} - list of all regular expressions to replace, and what to replace them with
     */
	getReplacementRegex() {
		return wdioReplacements;
	}

	/**
     * Gets a list of all regular expressions that have been transformed and need a .then() chained on to them
     * @return {Array<String>} - list of regex representing transformed code
     */
	getReplacedReturnRegex() {
		// look for temporary strings that need to be transformed into closures as well
		const allReplacements = this.getReplacementRegex().filter((replacement) => {
			return replacement.returnValue;
		});
		const allTemp = Object.keys(temp).filter((key) => {
			return !temp[key].dontTurnIntoClosure && allReplacements.some((replacement) => {
				return replacement.to.includes(temp[key].temporary);
			});
		}).map((key) => {
			return `.${temp[key].temporary}`;
		});

		return baseTransformedReturns.concat([
			"hasFocus(",
			"isVisible(",
			"getCookie",
			"getCookies",
			"getCssProperty",
			"getElementSize",
			"getHTML",
			".getLocation(",
			".getLocationInView(",
			"getTagName",
			"getText",
			"isEnabled(",
			"isExisting(",
			"browser.waitUntil(",
			"browser.call(",
			"localStorage(\"GET\"",
			"sessionStorage(\"GET\"",
			"browser.execute(",
			"waitForVisible",
			"getAttribute",
			".findFirst("
		]).concat(allTemp);
	}

	/**
     * Gets the name of the framework being used
     * @return {String} - the framework name
     */
	getName() {
		return name;
	}

	/**
     * Gets text that this strategy needs to append to the default support file
     * @return {String} - the text that this strategy needs to append to the default support file
     */
	getSupportAppendText() {
		return `
// initialize global browser object
const initBrowser = require("@intu/cyphfell/src/converters/wdio/InitializeBrowserFunctions.js");
initBrowser.init("browser");
Cypress.on("window:load", (win) => {
	initBrowser.initConsoleLog(browser, consoleSpies);
});

// TODO: uncomment this and replace the path to your WDIO config file
//const config = require("wdioConfigFile.js");
//initBrowser.initConfig(browser, config);
        `;
	}

	/**
	 * Gets the absolute path to the custom commands file for this strategy
	 * @return {String} - the absolute path to the custom commands file for this strategy if there is one, or an empty string otherwise
	 */
	getCommandsFilePath() {
		return fpUtil.findLocalFilePath("src/converters/wdio/WDIOCommands.js");
	}
}

module.exports = WDIOStrategy;