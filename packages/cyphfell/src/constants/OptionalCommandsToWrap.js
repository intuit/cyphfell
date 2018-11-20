const fs = require("fs");
const esprima = require("../util/EsprimaUtils");
const estraverse = require("estraverse");
const fp = require("../util/FilePathUtil");
const converter = require("../converters/ActiveConverter");

const customCommands = () => {
	const fileContents = [
		fs.readFileSync(fp.findLocalFilePath("defaultFiles/defaultCommandsFile.js"), "utf8"),
		converter.getStrategy().getCommandsFileContents()
	];
	const commands = [];

	fileContents.forEach((lines) => {
		const ast = esprima.generateAST(lines);
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "CallExpression" && node.arguments[1] && node.arguments[1].type === "ObjectExpression" &&
					!(node.arguments[1].properties[0] && node.arguments[1].properties[0].kind === "init" && node.arguments[1].properties[0].key.name === "prevSubject" &&
					node.arguments[1].properties[0].value.value === "element") && node.arguments[0].value) {
					commands.push(node.arguments[0].value);
				}
			}
		});
	});

	return commands;
};

module.exports = customCommands();