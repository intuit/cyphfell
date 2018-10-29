const wdio = require("./wdio/WDIOStrategy");
const nightwatch = require("./nightwatch/NightwatchStrategy");
const frameworks = require("../constants/FrameworkConstants");

let strategy;
class ActiveConverter {

	static init(framework) {
		// reset for testing purposes
		strategy = null;
		if (framework === frameworks.NightwatchJS) {
			strategy = new nightwatch();
		} else if (framework === frameworks.WebdriverIO) {
			strategy = new wdio();
		}

		strategy.init();
	}

	static getStrategy() {
		if (!strategy && process.env.CYPHFELL_TEST_FRAMEWORK) {
			this.init(process.env.CYPHFELL_TEST_FRAMEWORK);
		}
		return strategy;
	}
}

module.exports = ActiveConverter;