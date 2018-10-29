const replacements = require("../converters/wdio/TemporaryRegexReplacements");

module.exports = (str) => {
	Object.keys(replacements).forEach((replacement) => {
		replacement = replacements[replacement];
		const regex = new RegExp(replacement.temporary, "g");
		str = str.replace(regex, replacement.real);
	});
	return str;
};