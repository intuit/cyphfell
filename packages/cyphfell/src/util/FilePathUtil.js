const fs = require("fs");
const url = require("url");

class FilePathUtil {

	/**
	 * Finds the real path of the specified file if it exists
	 * @param {String} path - the path to the file without necessarily including an extension
	 * @return {String} - the path to the file with an extension if found, the path to the index.js file inside a directory if it exists and the input
	 * path was to that directory, or the input path if not found
	 */
	static findPathWithExtension(path) {
		if (!fs.existsSync(path)) {
			if (fs.existsSync(`${path}.js`)) {
				return `${path}.js`;
			} else if (fs.existsSync(`${path}.json`)) {
				return `${path}.json`;
			}
		} else if (fs.lstatSync(path).isDirectory()) {
			if (fs.existsSync(`${path}/index.js`)) {
				return `${path}/index.js`;
			}
		}
		return path;
	}

	/**
	 * Finds the absolute path to read a file in this module's local directory structure
	 * @param {String} localPath - the path relative to the current working directory
	 * @return {String} - the absolute path to the file
	 */
	static findLocalFilePath(localPath) {
		if (process.env.TESTING_LOCALLY === "true") {
			return `${process.cwd()}/${localPath}`;
		}
		return `${process.cwd()}/node_modules/@intuit/cyphfell/${localPath}`;
	}

	/**
	 * Finds the absolute path to the imported file
	 * @param {String} currentPath - the absolute path to the file importing another file
	 * @param {String} importPath - importPath - the path a file is being imported from
	 * @return {String} - the absolute path to the file being imported
	 */
	static findAbsolutePathToImport(currentPath, importPath) {
		let path = this.findPathWithExtension(url.resolve(currentPath, importPath));
		if (fs.existsSync(path)) {
			return path.replace("//", "/");
		}
		const testExistence = (resolver, pathTest) => {
			if (resolver.includes("node_modules")) {
				const newPath = options.replaceModuleImport(pathTest);
				if (newPath) {
					return newPath.replace("//", "/");
				}
			}
			return pathTest.replace("//", "/");
		};

		// TODO: tests for aliasing
		for (const resolver of options.moduleResolvePaths) {
			path = this.findPathWithExtension(url.resolve(resolver + "/", importPath));
			if (fs.existsSync(path)) {
				return testExistence(resolver, path);
			} else {
				for (const alias of options.moduleAliases) {
					const aliasedPath = this.findPathWithExtension(url.resolve(resolver + "/", importPath.replace(alias.alias, alias.actual)));
					if (importPath.startsWith(alias.alias) && fs.existsSync(aliasedPath)) {
						return testExistence(resolver, aliasedPath);
					}
				}
			}
		}

		if (!importPath.endsWith(".js") && !importPath.endsWith(".json")) {
			importPath = `${importPath}.js`;
		}
		return url.resolve(currentPath, importPath);
	}
}

module.exports = FilePathUtil;