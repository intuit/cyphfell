const activeConverter = require("../../../src/converters/ActiveConverter");
const frameworks = require("../../../src/constants/FrameworkConstants");
const wdio = require("../../../src/converters/wdio/WDIOStrategy");
const njs = require("../../../src/converters/nightwatch/NightwatchStrategy");

describe("Tests ActiveConverter", function() {

    it("Tests init() with WDIO", () => {
        activeConverter.init(frameworks.WebdriverIO);
        expect(activeConverter.getStrategy().getName()).to.be.equal(new wdio().getName());
    });

    it("Tests init() with Nightwatch", () => {
        activeConverter.init(frameworks.NightwatchJS);
        expect(activeConverter.getStrategy().getName()).to.be.equal(new njs().getName());
    });

    it("Tests init() with invalid selection", () => {
        let errThrown = false;
        try {
            activeConverter.init("some invalid selection");
        } catch (ex) {
            errThrown = true;
        }
        expect(errThrown).to.be.true;
    });
});