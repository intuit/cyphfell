const fs = require("fs");

class BaseStrategy {

	/**
     * Initializes this strategy after construction
     */
	init() {
		const path = this.getCommandsFilePath();
		try {
			if (path !== "") {
				this.commandsFileContents = fs.readFileSync(path, "utf8");
			} else {
				this.commandsFileContents = "";
			}
		} catch (ex) {
			console.error(ex);
			this.commandsFileContents = "";
		}
	}

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
		return [];
	}

	/**
     * Gets the name of the framework being used
     * @return {String} - the framework name
     */
	getName() {
		return "";
	}

	/**
     * Gets text that this strategy needs to append to the default support file
     * @return {String} - the text that this strategy needs to append to the default support file
     */
	getSupportAppendText() {
		return "";
	}

	/**
     * Gets the absolute path to the custom commands file for this strategy
     * @return {String} - the absolute path to the custom commands file for this strategy if there is one, or an empty string otherwise
     */
	getCommandsFilePath() {
		return "";
	}

	/**
     * Gets the contents of this strategy's custom commands file
     * @return {String} - the contents of this strategy's custom commands file
     */
	getCommandsFileContents() {
		return this.commandsFileContents;
	}
}

module.exports = BaseStrategy;