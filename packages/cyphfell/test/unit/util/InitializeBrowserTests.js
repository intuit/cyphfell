const util = require("../../../src/converters/wdio/InitializeBrowserFunctions.js");

describe("Tests InitializeBrowserTests functions", function () {

    before(() => {
        global.Cypress = { on: () => {}};
    });

    it("Tests initializing global browser object", () => {
        util.init("browser");
        expect(global.browser).to.not.be.undefined;
        expect(browser.desiredCapabilities.browserName).to.be.equal("chrome");
        expect(typeof browser.options).to.be.equal("object");

        util.init("clientNameTest");
        expect(global.clientNameTest).to.not.be.undefined;
    });

    it("Tests initializing config object", () => {
        util.init("browser");
        const config = {
            testKey1: "a",
            testKey2: () => {},
            testKey3: [25, 3]
        };
        util.initConfig(browser, config);
        expect(browser.options.testKey1).to.be.equal(config.testKey1);
        expect(browser.options.testKey2).to.deep.equal([config.testKey2]);
        expect(browser.options.testKey3).to.be.equal(config.testKey3);
    });
});