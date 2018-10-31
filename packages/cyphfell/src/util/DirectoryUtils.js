const glob = require("glob"),
	fs = require("fs"),
	path = require("path"),
	regex = require("./RegexUtil"),
	esprima = require("./EsprimaUtils"),
	estraverse = require("estraverse"),
	filePathUtil = require("./FilePathUtil");

/**
 * Gets the path to the Cypress integration folder
 * @param {String} cypressFolder - the path to the cypress folder from the CWD
 * @return {String} - the path to the Cypress integration folder
 */
const getIntegrationsDirectory = (cypressFolder) => {
	return path.join(DirectoryUtils.getCypressFolderDirectory(cypressFolder), "/integration/");
};

const containsFunction = (str, dir, funcName) => {
	const makeFileObject = (currentFileDir, importContents) => {
		return {
			absPath: currentFileDir,
			fileContents: importContents
		};
	};

	const files = [makeFileObject(dir, str)];
	while (files.length > 0) {
		const file = files.pop();
		const ast = esprima.generateAST(file.fileContents);
		let found = false;
		estraverse.traverse(ast, {
			enter: function(node) {
				if (node.type === "CallExpression" && node.callee.name === funcName) {
					found = true;
					this.break();
					return true;
				} else if (node.type === "ImportDeclaration" && !esprima.generateCodeFromAST(node).includes(" from ")) {
					const absPath = filePathUtil.findAbsolutePathToImport(file.absPath, node.source.value);
					try {
						files.push(
							makeFileObject(absPath, fs.readFileSync(absPath, "utf8"))
						);
					} catch (ex) {
						console.error(`Could not find path: ${absPath}`);
					}
				}
			}
		});
		if (found) {
			return true;
		}
	}
	return false;
};

class DirectoryUtils {

	/**
     * Gets the Cypress folder directory
     * @param {String} cypressFolder - the relative path to the cypress folder from the CWD
     * @return {String} - the cypress folder directory
     */
	static getCypressFolderDirectory(cypressFolder) {
		return path.join(process.cwd(), cypressFolder);
	}

	/**
     * Gets whether the input contents represent a test file
     * @param {String} lines - all lines in the file
     * @param {String} dir - the file absolute directory
     * @return {boolean} - whether the input contents represent a test file
     */
	static isTestFile(lines, dir) {
		return !dir.includes(".json") && containsFunction(lines, dir, "describe");
	}

	/**
     * Gets all relevant WDIO files that could possibly be converted
     * @param {String} globPattern - the glob pattern to use to search for files
     * @return {Array<Object>} - a list of all files, in the form of: {path: path to the file, contents: file contents, fileName: the name of the file}
     */
	static getAllTestFiles(globPattern) {
		return glob.sync(globPattern).filter((file) => {
			return !file.includes(".spec.js");
		}).map((file) => {
			const slashSplit = file.split("/");
			const name = slashSplit[slashSplit.length - 1];
			return {
				path: file,
				contents: fs.readFileSync(file, "utf8"),
				fileName: name.replace(".", "")
			};
		});
	}

	/**
     * Verifies that the cypress directories exist, and if they do not, it creates them
     * @param {String} cypressFolder - the relative path to the cypress folder from the CWD
     */
	static verifyCypressDirectory(cypressFolder) {
		const cyDir = this.getCypressFolderDirectory(cypressFolder);
		const converter = require("../converters/ActiveConverter").getStrategy();
		const supportAppend = converter.getSupportAppendText();

		if (!fs.existsSync(cyDir)) {
			console.log(`${cyDir} does not exist. Creating...`);
			fs.mkdirSync(cyDir);
			fs.mkdirSync(path.join(cyDir, "/integration/"));
			fs.mkdirSync(path.join(cyDir, "/plugins/"));
			fs.mkdirSync(path.join(cyDir, "/support/"));
			fs.mkdirSync(path.join(cyDir, "/screenshots/"));
			fs.writeFileSync(path.join(cyDir, "/plugins/index.js"), fs.readFileSync(`${process.cwd()}/node_modules/cyphfell/defaultFiles/defaultPluginFile.js`, "utf8"));
			fs.writeFileSync(path.join(cyDir, "/support/index.js"), fs.readFileSync(`${process.cwd()}/node_modules/cyphfell/defaultFiles/defaultSupportFile.js`, "utf8") + supportAppend);
			fs.writeFileSync(path.join(cyDir, "/support/commands.js"), fs.readFileSync(`${process.cwd()}/node_modules/cyphfell/defaultFiles/defaultCommandsFile.js`, "utf8"));
			const dirRegex = new RegExp(regex.formatRegex("test/cypress"), "g");
			const cypressJson = JSON.parse(fs.readFileSync(`${process.cwd()}/node_modules/cyphfell/defaultFiles/defaultConfigFile.json`, "utf8").replace(dirRegex, cypressFolder));
			if (fs.existsSync(`${process.cwd()}/cypress.json`)) {
				const existingJson = JSON.parse(fs.readFileSync(`${process.cwd()}/cypress.json`, "utf8"));
				Object.assign(cypressJson, existingJson);
			}
			fs.writeFileSync(`${process.cwd()}/cypress.json`, JSON.stringify(cypressJson, null, 2));
		}
		fs.writeFileSync(path.join(cyDir, "/support/frameworkCommands.js"), converter.getCommandsFileContents());
	}

	/**
     * Gets the new path to place the specified file in
     * @param {String} oldPath - the path the file is currently in
     * @param {String} oldContents - the contents of the file before modifications were made
     * @param {Object} options - the CLI options selected
     * @return {String} - the new path to place the file in
     */
	static getNewFilePath(oldPath, oldContents, options) {
		if (path.dirname(oldPath) === process.cwd()) {
			return oldPath;
		}
		const baseFolder = options.baseNormalFolder ? options.baseNormalFolder.substring(0, options.baseNormalFolder.length - 1) : "";
		if (this.isTestFile(oldContents, oldPath)) {
			return oldPath.replace(`${process.cwd()}/${baseFolder}`, getIntegrationsDirectory(options.cypressFolder)).replace("//", "/").replace(".js", ".spec.js");
		}

		// make the new absolute path based on the current path relative to the base test directory
		const splitPoint = `${process.cwd()}/${baseFolder}`;
		if (oldPath.includes(splitPoint)) {
			return path.join(this.getCypressFolderDirectory(options.cypressFolder), oldPath.split(splitPoint)[1]);
		}
		// the old path is outside of the base test directory, so leave it the same
		return oldPath;
	}

}

module.exports = DirectoryUtils;