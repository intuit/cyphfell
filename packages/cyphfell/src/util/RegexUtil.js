const esprima = require("esprima"),
	codegen = require("escodegen"),
	estraverse = require("estraverse");

const unevenBrackets = (str) => {
	return (str.match(/\(/g) || []).length !== (str.match(/\)/g) || []).length;
};

const findUnevenBracketStartIndex = (str) => {
	const stack = [];
	let i = 0;
	while (i < str.length) {
		if (str.charAt(i) === "(") {
			stack.push("(");
		} else if (str.charAt(i) === ")") {
			if (stack.length === 0) {
				return i;
			}
			stack.pop();
		}
		++i;
	}
	return -1;
	//throw new Error("Could not find uneven bracket start index");
};

const formatRegex = (regex) => {
	return regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/param/g, "([^,]*)").
		replace("rest", ".*?").replace(/captureAll/g, "(.*)");
};

module.exports = {
	formatRegex: formatRegex,
	replaceAll: (str, regex, replaceWith, offsetFirst) => {
		let finalString = str;
		let result;
		do {
			result = regex.exec(finalString);

			// correct regex groups in cases where function call arguments contain ,
			if (!result && regex.toString().includes(formatRegex("param")) && finalString.includes(",")) {
				const tempRegex = new RegExp(regex.toString().replace(formatRegex("param"), formatRegex("captureAll")).replace("/g", "").substring(1), "g");
				const result2 = tempRegex.exec(finalString);
				if (result2) {
					if (result2[1].includes(").") && !regex.toString().includes("\)\.")) {
						result2[1] = result2[1].substring(0, result2[1].lastIndexOf(")."));
						result2[0] = result2[0].substring(0, result2[0].lastIndexOf(").") + 1);
					}
					try {
						let astInput = result2[0].includes("return ") ? result2[0].replace("return ", "") : result2[0];
						if (astInput.startsWith(".")) {
							astInput = astInput.substring(1);
						}
						if ((astInput.match(/\)/g) || []).length !== (astInput.match(/\(/g) || []).length && result2[0].endsWith(")")) {
							astInput = astInput.substr(0, astInput.length - 1);
							result2[0] = result2[0].substr(0, result2[0].length - 1);
						}
						const ast = esprima.parse(astInput);
						estraverse.traverse(ast, {
							enter: (node) => {
								if (node.type === "CallExpression") {
									node.arguments.forEach((arg, index) => {
										result2[index + 1] = codegen.generate(arg);
									});
								}
							}
						});
					} catch (ex) {
						console.error(ex);
					}
					result = result2;
				}
			}
			if (result) {
				if (regex.toString().includes(formatRegex("param")) && result[1] && unevenBrackets(result[1])) {
					const bracketIndex = findUnevenBracketStartIndex(result[1]);
					if (bracketIndex === -1) {
						const ast = esprima.parse(result.input.includes("return ") ? result.input.replace("return ", "") : result.input);
						//result[1] = codegen.generate(ast.body[0].expression.arguments[0]);
						result[0] = codegen.generate(ast);
						// not a chained call (ex: browser.element("");)
						if (ast.body[0].expression) {
							if (ast.body[0].expression.arguments.length > 0) {
								for (let i = 0; i < ast.body[0].expression.arguments.length; ++i) {
									result[i + 1] = codegen.generate(ast.body[0].expression.arguments[i]);
								}
							} else if (ast.body[0].expression.callee && ast.body[0].expression.callee.type === "MemberExpression" && ast.body[0].expression.callee.object &&
								ast.body[0].expression.callee.object.type === "CallExpression") {
								// chained call (ex: browser.element("").click();)
								for (let i = 0; i < ast.body[0].expression.callee.object.arguments.length; ++i) {
									result[i + 1] = codegen.generate(ast.body[0].expression.callee.object.arguments[i]);
								}
							}
						}
					} else {
						result[1] = result[1].substring(0, bracketIndex);
						result[0] = result[0].substring(0, result[0].indexOf(result[1]) + result[1].length + 1);
					}
				}
				const groups = result.slice(1);
				let currentReplacement = replaceWith;
				if (groups.length > 0) {
					// replace parameterized values with group captures
					for (let i = 0; i < groups.length; ++i) {
						currentReplacement = currentReplacement.replace("${param" + (i + offsetFirst + 1) + "}", groups[i]);
					}
				}

				const oldFS = finalString;
				finalString = finalString.replace(result[0], currentReplacement);
				if (oldFS === finalString && offsetFirst === 1) {
					break;
				}
			}
		} while (result);
		return finalString;
	},
	getErrorConditionValue: (line, condition, regex, offsetFirst) => {
		const result = regex.exec(line);
		if (result) {
			const groups = result.slice(1);
			if (groups.length > 0) {
				// replace parameterized values with group captures
				for (let i = 0; i < groups.length; ++i) {
					condition = condition.replace("${param" + (i + offsetFirst + 1) + "}", groups[i]);
				}
			}
			return condition;
		}
		return null;
	},
	/**
     * Traverses a bracket stack to find out a complete function call string from a regex result
     * @param {Object} result - the regex result object
     * @param {String} str - the original string
     * @return {String} - the complete function call declaration (without ;)
     */
	traverseBracketStack: (result, str) => {
		const bracketStack = ["("];
		let index = result.index + result[0].length;
		while (bracketStack.length > 0) {
			if (str.charAt(index) === "(") {
				bracketStack.push("(");
			} else if (str.charAt(index) === ")") {
				bracketStack.pop();
			}
			++index;
		}
		return str.substring(result.index, index);
	}
};