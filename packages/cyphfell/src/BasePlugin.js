/* eslint no-unused-vars: 0 */

const frameworks = require("./constants/FrameworkConstants");

/**
 * Represents a plugin that can make modifications to a JavaScript file's AST
 */
class BasePlugin {

	/**
     * Makes modifications to the AST before lines are converted using regular expression
     * @param {Object} ast - the AST representing the code in a file
     * @param {String} newFileDir - the new directory of the file being modified
     */
	beforeParseLines(ast, newFileDir) {
	}

	/**
     * Makes modifications to the AST after lines are converted using regular expression
     * @param {Object} ast - the AST representing the code in a file
     * @param {String} newFileDir - the new directory of the file being modified
     */
	afterParseLines(ast, newFileDir) {
	}

	/**
     * Makes modifications to the AST before transforming the code after the initial regular expression conversion is finished
     * @param {Object} ast - the AST representing the code in a file
     * @param {String} newFileDir - the new directory of the file being modified
     */
	beforeTransformAfterParsing(ast, newFileDir) {
	}

	/**
     * Makes modifications to the AST after transforming the code after the initial regular expression conversion is finished
     * @param {Object} ast - the AST representing the code in a file
     * @param {String} newFileDir - the new directory of the file being modified
     */
	afterTransformAfterParsing(ast, newFileDir) {
	}

	/**
	 * Provides access to the AST after all changes are made to a file. Changes made to the AST here will not be used
	 * @param {Object} ast - the AST representing the final converted code for a file
	 * @param {String} newFileDir - the new directory of the file being modified
	 */
	afterComplete(ast, newFileDir) {
	}

	/**
     * Gets the unique name of this plugin
     * @return {String} - the unique name of this plugin
     */
	getName() {
		return "";
	}

	/**
	 * Gets a list of all frameworks that this plugin supports
	 * @return {Array<String>} - the unique names of all frameworks that this plugin supports
	 */
	getSupportedFrameworks() {
		return [frameworks.WebdriverIO];
	}

}

module.exports = BasePlugin;