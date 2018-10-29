const regexUtil = require("../util/RegexUtil");

const removeUnnecessaryClosures = (str) => {
	const regex = new RegExp(`${regexUtil.formatRegex(".then(")}(.*?) => {\\s*\\1;\\s*${regexUtil.formatRegex("});")}`, "g");
	const regex2 = new RegExp(`${regexUtil.formatRegex(".then(")}(.*?) => {\\s*${regexUtil.formatRegex("});")}`, "g");
	const regex3 = new RegExp(`${regexUtil.formatRegex(".then(")}(.*?) => {\\s*return \\1;\\s*${regexUtil.formatRegex("});")}`, "g");
	return str.replace(regex, ";").replace(regex2, ";").replace(regex3, ";");
};

const removeUnnecessaryExpressions = (str) => {
	const regex = new RegExp(`${regexUtil.formatRegex(".then(")}(.*?) => {\\s*\\1;`, "g");
	let result;
	do {
		result = regex.exec(str);
		if (result) {
			str = str.replace(result[0], `.then(${result[1]} => {`);
		}

	} while (result);
	return str;
};

const removeUnnecessaryVariables = (str) => {
	const regex = new RegExp(`${regexUtil.formatRegex(".then(")}(.*?) => {\\s*const ([^=]*?) = \\1;`, "g");
	let result;
	do {
		result = regex.exec(str);
		if (result) {
			str = str.replace(result[0], `.then(${result[2]} => {`);
		}
	} while (result);
	return str;
};

module.exports = (str) => {
	str = removeUnnecessaryClosures(str);
	str = removeUnnecessaryExpressions(str);
	str = removeUnnecessaryVariables(str);
	return str;
};