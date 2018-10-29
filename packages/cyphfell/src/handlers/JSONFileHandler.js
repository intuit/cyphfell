const AbstractFileHandler = require("./AbstractFileHandler");

class JSONFileHandler extends AbstractFileHandler {

	/**
     * Gets whether this handler can convert the specified file
     * @param {String} dir - the path to the file
     * @return {boolean}
     */
	canHandle(dir) {
		return dir.endsWith(".json");
	}

	parseImpl(plugins) {
		return this.lines;
	}
}

module.exports = JSONFileHandler;