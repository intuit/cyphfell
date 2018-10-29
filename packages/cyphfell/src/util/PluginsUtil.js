const glob = require("glob"),
	path = require("path");

class PluginsUtil {

	static loadPlugins(pattern) {
		const allPlugins = [];
		glob.sync(pattern).forEach((file) => {
			const pluginImport = require(path.resolve(file));
			allPlugins.push(new pluginImport());
		});
		return allPlugins;
	}

	/**
     * Gets all activated plugins
     * @param {Array<BasePlugin>} extraPlugins - external plugins that should be activated
     * @param {Array<String>} disabledDefaultPlugins - the unique ID of each default plugin to disable
     * @param {String} pattern - the glob pattern to use to load default plugins
     * @return {Array<BasePlugin>} - all activated plugins
     */
	static getActivatedPlugins(extraPlugins, disabledDefaultPlugins, pattern = "./node_modules/@intu/cyphfell/src/plugins/*") {
		const framework = require("../converters/ActiveConverter").getStrategy().getName();
		return this.loadPlugins(pattern).filter((plugin) => {
			return !disabledDefaultPlugins.some((id) => plugin.getName() === id);
		}).concat(extraPlugins).filter((plugin) => plugin.getSupportedFrameworks().includes(framework));
	}

	/**
	 * Invokes the given method across all plugins
	 * @param {Array<Object>} plugins - all plugins that are active
	 * @param {Object} ast - the AST to pass into the method
	 * @param {String} methodName - the name of the method to invoke
	 * @param {String} newFileDir - the new path to the file that is currently being modified
	 */
	static invokePlugins(plugins, ast, methodName, newFileDir) {
		plugins.forEach((plugin) => {
			plugin[methodName](ast, newFileDir);
		});
	}
}

module.exports = PluginsUtil;

