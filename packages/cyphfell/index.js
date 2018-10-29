const dir = require("./src/util/DirectoryUtils"),
	fs = require("fs-extra"),
	pluginLoader = require("./src/util/PluginsUtil"),
	report = require("./src/reports/ReportGenerator"),
	frameworks = require("./src/constants/FrameworkConstants"),
	converter = require("./src/converters/ActiveConverter"),
	exec = require("child_process"),
	eslintConfig = require("./src/constants/EslintConstants"),
	defaultOptions = {
		cypressFolder: "test/cypress/",
		baseNormalFolder: "test/",
		enableAssertions: false,
		glob: "${CWD}/test/!(unit|ui-perf|cypress)/**/*.+(js|jsx|json)",
		transpile: false,
		validateCypressDir: true,
		reportOutputFolder: "cyphfell-output",
		replaceModuleImport: (importPath, includeModulesFolder = true) => {
			return "";
		},
		transformModuleImportIntoCypress: (originalImport) => {
			return originalImport;
		},
		disabledPlugins: ["ArgumentSeparation", "TernaryOperator"],
		framework: frameworks.WebdriverIO,
		eslint: eslintConfig.DISABLED,
		moduleResolvePaths: [`${process.cwd()}`, `${process.cwd()}/node_modules`],
		moduleAliases: []
	};

module.exports = (options = {}, plugins = []) => {
	options = Object.assign({}, defaultOptions, options);
	options.glob = options.glob.replace("${CWD}", process.cwd());
	if (!options.baseNormalFolder.endsWith("/")) {
		options.baseNormalFolder += "/";
	}
	if (!options.cypressFolder.endsWith("/")) {
		options.cypressFolder += "/";
	}

	converter.init(options.framework);
	const parser = require("./src/util/FileParser");

	plugins = pluginLoader.getActivatedPlugins(plugins, options.disabledPlugins);

	if (options.validateCypressDir) {
		dir.verifyCypressDirectory(options.cypressFolder);
	}

	global.options = options;
	try {
		dir.getAllTestFiles(options.glob).forEach((file) => {
			console.log(`Starting for: ${file.path}`);
			const path = dir.getNewFilePath(file.path, file.contents, options);
			report.onFileStart(file.path, path);
			const updatedLines = parser(file.contents, file.path, options, plugins);

			fs.mkdirsSync(path.substring(0, path.lastIndexOf("/")));
			fs.writeFileSync(path, updatedLines);
			try {
				if (options.eslint === eslintConfig.LOCAL) {
					exec.execSync(`./node_modules/.bin/eslint --fix ${path}`);
				} else if (options.eslint === eslintConfig.GLOBAL) {
					exec.execSync(`eslint --fix ${path}`);
				}
				console.log(`Finished for: ${file.path}`);
			} catch (eslintEx) {
				console.error(`Could not automatically fix ESlint errors for ${path}`);
			}
		});
	} catch (ex) {
		console.error(ex);
	}

	report.generateReport(plugins);
};