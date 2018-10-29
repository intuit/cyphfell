const BasePlugin = require("../BasePlugin");
const esprima = require("../util/EsprimaUtils");

/**
 * This plugin removes all occurrences of the .ELEMENT property from an AST.
 * Used for elementId* functions, because they expect to have the value of the .ELEMENT property passed into them, but in Cypress
 * the elements can be passed in directly instead
 */
class ElementIdPlugin extends BasePlugin {

	/**
     * Makes modifications to the AST after transforming the code after the initial regular expression conversion is finished
     * @param {Object} ast - the AST representing the code in a javascript file
     */
	afterTransformAfterParsing(ast) {
		// TODO: prefer to delete this plugin and replace it with RegEx in RegexReplacements.js
		const newAST = esprima.generateAST(esprima.generateCodeFromAST(ast).replace(/\.ELEMENT/g, ""));
		Object.keys(ast).forEach((key) => {
			delete ast[key];
		});
		Object.assign(ast, newAST);
	}

	/**
     * Gets the unique name of this plugin
     * @return {String} - the unique name of this plugin
     */
	getName() {
		return "ElementId";
	}

}

module.exports = ElementIdPlugin;