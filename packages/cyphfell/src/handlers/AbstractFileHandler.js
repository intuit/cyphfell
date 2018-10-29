const dirUtil = require("../util/DirectoryUtils");

class AbstractFileHandler {

	/**
     * Gets whether this handler can convert the specified file
     * @param {String} dir - the path to the file
     * @return {boolean}
     */
	canHandle(dir) {
		return false;
	}

	parseImpl(plugins) {
		return this.lines;
	}

	/**
     * Parses a test file and converts it into Cypress format if necessary
     * @param {String} lines - all of the lines in the file
     * @param {String} dir - the path to the file
     * @param {Array<BasePlugin>} plugins - all plugins that will modify the AST
     * @return {String?} - the lines in the file after modifications are made, or null if a modification could not be made
     */
	handleParseAttempt(lines, dir, plugins) {
		if (!this.canHandle(dir)) {
			return null;
		}

		this.lines = lines;
		this.fileDir = dir;
		this.newFileDir = dirUtil.getNewFilePath(dir, lines, options);
		return this.parseImpl(plugins);
	}

}

module.exports = AbstractFileHandler;