const rewire = require("rewire");
const regex = rewire("../../../src/util/RegexUtil");

describe("Tests RegexUtil private functions", function () {

    it("Tests unevenBrackets", () => {
        const fn = regex.__get__("unevenBrackets");
        expect(fn("")).to.be.false;
        expect(fn("()")).to.be.false;
        expect(fn("(")).to.be.true;
        expect(fn(")")).to.be.true;
        expect(fn("()(")).to.be.true;
        expect(fn("())")).to.be.true;
        expect(fn("((")).to.be.true;
        expect(fn("))")).to.be.true;
    });

    it("Tests findUnevenBracketStartIndex", () => {
        const fn = regex.__get__("findUnevenBracketStartIndex");
        expect(fn("")).to.be.equal(-1);
        expect(fn("()")).to.be.equal(-1);
        expect(fn(")")).to.be.equal(0);
        expect(fn("())")).to.be.equal(2);
    });

});

describe("Tests RegexUtil exported functions", function() {

    it("Tests formatRegex", () => {
        const fn = regex["formatRegex"];
        expect(fn("param")).to.be.equal("([^,]*)");
        expect(fn("param, param, param")).to.be.equal("([^,]*)\\,\\ ([^,]*)\\,\\ ([^,]*)");
        expect(fn("*")).to.be.equal("\\*");
    });

    describe("Tests replaceAll function", function() {
        it("Tests with no replacements made", () => {
            expect(
                regex.replaceAll("fakeString", new RegExp("fakeRegex", "g"), "nothing", 0)
            ).to.be.equal("fakeString");

            expect(
                regex.replaceAll("fakeString", new RegExp(regex.formatRegex("fakeRegex(param)"), "g"), 0)
            ).to.be.equal("fakeString");
        });

        it("Tests replacing no parameter", () => {
            expect(
                regex.replaceAll("fakeString", new RegExp("fake", "g"), "test", 0)
            ).to.be.equal("testString");
        });

        it("Tests replacing one parameter", () => {
            expect(
                regex.replaceAll("fakeString(abc)", new RegExp(regex.formatRegex("fakeString(param)"), "g"), "test${param1}", 0)
            ).to.be.equal("testabc");
        });

        it("Tests replacing two parameters", () => {
            expect(
                regex.replaceAll("fakeString(abc, 9001)", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), "test${param2}${param1}", 0)
            ).to.be.equal("test 9001abc");

            expect(
                regex.replaceAll("fakeString(abc, 9001)", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), "test${param1}${param2}", 0)
            ).to.be.equal("testabc 9001");
        });

        it("Tests replacing two parameters with offsetFirst=1", () => {
            expect(
                regex.replaceAll("fakeString(abc, 9001)", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), "test${param2}", 1)
            ).to.be.equal("testabc");

            expect(
                regex.replaceAll("fakeString(abc, 9001)", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), "test${param2}${param3}", 1)
            ).to.be.equal("testabc 9001");
        });

        it("Tests replacing one parameter with comma in parameter", () => {
            expect(
                regex.replaceAll("fakeString('text()=`fake`,')", new RegExp(regex.formatRegex("fakeString(param)"), "g"), "test${param1}", 0)
            ).to.be.equal("test'text()=`fake`,'");

            expect(
                regex.replaceAll("fakeString('text()=`fake`,').doSomething()", new RegExp(regex.formatRegex("fakeString(param)"), "g"), "test${param1}", 0)
            ).to.be.equal("test'text()=`fake`,'.doSomething()");
        });

        it("Tests replacing with multiple matches", () => {
            expect(
                regex.replaceAll("test string test string", new RegExp("string", "g"), "cyphfell", 0)
            ).to.be.equal("test cyphfell test cyphfell");
        });
    });

    describe("Tests getErrorConditionValue function", function() {

        it("Tests with no replacements made", () => {
            expect(
                regex.getErrorConditionValue("fakeString", "false", new RegExp("fakeRegex", "g"), 0)
            ).to.be.equal(null);

            expect(
                regex.getErrorConditionValue("fakeString", "false", new RegExp(regex.formatRegex("fakeRegex(param)"), "g"), 0)
            ).to.be.equal(null);
        });

        it("Tests replacing no parameter", () => {
            expect(
                regex.getErrorConditionValue("fakeString", "false", new RegExp("fake", "g"), 0)
            ).to.be.equal("false");
        });

        it("Tests replacing one parameter", () => {
            expect(
                regex.getErrorConditionValue("fakeString(abc)", "${param1}", new RegExp(regex.formatRegex("fakeString(param)"), "g"), 0)
            ).to.be.equal("abc");
        });

        it("Tests replacing two parameters", () => {
            expect(
                regex.getErrorConditionValue("fakeString(abc,9001)", "${param1} - ${param2}", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), 0)
            ).to.be.equal("abc - 9001");

            expect(
                regex.getErrorConditionValue("fakeString(abc,9001)", "${param2} - ${param1}", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), 0)
            ).to.be.equal("9001 - abc");
        });

        it("Tests replacing two parameters with offsetFirst=1", () => {
            expect(
                regex.getErrorConditionValue("fakeString(abc,9001)", "${param2}", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), 1)
            ).to.be.equal("abc");

            expect(
                regex.getErrorConditionValue("fakeString(abc,9001)", "${param2}${param3}", new RegExp(regex.formatRegex("fakeString(param,param)"), "g"), 1)
            ).to.be.equal("abc9001");
        });

    });
});