const commandLineArgs = require("command-line-args"),
	frameworks = require("./src/constants/FrameworkConstants"),
	eslint = require("./src/constants/EslintConstants"),
	optionDefinitions = [
		{name: "cypressFolder", alias: "c", type: String, defaultValue: "test/cypress/"},
		{name: "baseNormalFolder", alias: "b", type: String, defaultValue: "test/"},
		{name: "enableAssertions", alias: "a", type: Boolean, defaultValue: false},
		{name: "glob", alias: "g", type: String, defaultValue: "${CWD}/test/!(unit|ui-perf|cypress)/**/*.+(js|json)"},
		{name: "transpile", alias: "t", type: Boolean, defaultValue: false},
		{name: "validateCypressDir", alias: "v", type: Boolean, defaultValue: false},
		{name: "framework", alias: "f", type: String, defaultValue: frameworks.WebdriverIO},
		{name: "eslint", alias: "e", type: Number, defaultValue: eslint.DISABLED}

	],
	options = commandLineArgs(optionDefinitions);

module.exports = options;