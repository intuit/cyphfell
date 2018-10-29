const BaseStrategy = require("../BaseStrategy");
const name = require("../../constants/FrameworkConstants").NightwatchJS;

class NightwatchStrategy extends BaseStrategy {

	/**
     * Gets a list of all regular expressions to replace, and what to replace them with
     * @return {Array<String>} - list of all regular expressions to replace, and what to replace them with
     */
	getReplacementRegex() {
		return [];
	}

	/**
     * Gets a list of all regular expressions that have been transformed and need a .then() chained on to them
     * @return {Array<String>} - list of regex representing transformed code
     */
	getReplacedReturnRegex() {
		// TODO: do this
		return [];
	}

	/**
     * Gets the name of the framework being used
     * @return {String} - the framework name
     */
	getName() {
		return name;
	}
}

module.exports = NightwatchStrategy;