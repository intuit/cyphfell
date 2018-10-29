const JavaScriptFileHandler = require("./JavaScriptFileHandler");
const JSONFileHandler = require("./JSONFileHandler");

module.exports = [
	new JavaScriptFileHandler(),
	new JSONFileHandler()
];