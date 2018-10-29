const util = require("../../../src/regex/ReplaceTemporaryRegex.js");
const replacements = require("../../../src/converters/wdio/TemporaryRegexReplacements");

describe("Tests ReplaceTemporaryRegex utility", function() {

	it("Tests to make sure all temporary replacements are made", () => {
		Object.keys(replacements).forEach((replacement) => {
			replacement = replacements[replacement];
			expect(util(replacement.temporary)).to.be.equal(replacement.real);
		});

		expect(util(`${replacements.IS_SELECTED.temporary}.${replacements.IS_SELECTED.temporary}`)).to.be.
			equal(`${replacements.IS_SELECTED.real}.${replacements.IS_SELECTED.real}`, "Failed to replace multiple instances of same temporary string");
	});

	it("Tests to make sure no replacement is made in some cases", () => {
		expect(util("ABCDEFGHIJKLMNOPQRSTUV  AIA  A  A A A A A")).to.be.equal("ABCDEFGHIJKLMNOPQRSTUV  AIA  A  A A A A A", "Failed when no string should be replaced");
		expect(util("")).to.be.equal("");
	});
});