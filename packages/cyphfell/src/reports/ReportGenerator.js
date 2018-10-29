const _ = require("lodash");
const fs = require("fs-extra");
const fp = require("../util/FilePathUtil");

const getConfigToWrite = (plugins) => {
	const configToWrite = _.cloneDeep(global.options);
	Object.keys(configToWrite).forEach((key) => {
		if (typeof configToWrite[key] === "function") {
			configToWrite[key] = {value: configToWrite[key].toString(), func: true};
		}
	});
	configToWrite.plugins = plugins.map((plugin) => plugin.getName());
	return Object.keys(configToWrite).map((key) => {
		const property = {
			name: key
		};
		if (!Array.isArray(configToWrite[key]) && typeof configToWrite[key] === "object") {
			property.value = configToWrite[key].value;
			property.isFunctionDefinition = true;
		} else {
			if (configToWrite[key].length > 0 && typeof configToWrite[key][0] === "object") {
				property.value = configToWrite[key].map((configItem) => JSON.stringify(configItem));
			} else {
				property.value = configToWrite[key];
			}
		}
		return property;
	});
};

class ReportGenerator {

	constructor() {
		this.files = [];
	}

	onFileStart(oldPath, newPath) {
		this.files.push({
			path: oldPath,
			criticalError: null,
			warnings: [],
			lineErrors: [],
			newPath: newPath
		});
	}

	onTransformationError(errorMessage, line) {
		this.files[this.files.length - 1].lineErrors.push({
			line: line,
			message: errorMessage
		});
	}

	onCriticalError(stackTrace) {
		this.files[this.files.length - 1].criticalError = stackTrace;
	}

	onWarning(message, code, lineNumber) {
		this.files[this.files.length - 1].warnings.push({
			code: code,
			message: message,
			lineNumber: lineNumber
		});
	}

	generateReport(plugins) {
		const configToWrite = getConfigToWrite(plugins);
		let report = fs.readFileSync(fp.findLocalFilePath("defaultFiles/reportTemplate.html"), "utf8");

		let successfullyConverted = 0;
		let lineErrors = 0;
		let warnings = 0;
		const criticalErrors = [];
		const warningDetails = [];
		const lineErrorDetails = [];

		this.files.forEach((file) => {
			if (file.criticalError) {
				criticalErrors.push({
					filePath: file.path,
					stackTrace: file.criticalError,
					newFilePath: file.newPath
				});
			} else {
				++successfullyConverted;
			}

			warnings += file.warnings.length;
			if (file.warnings.length > 0) {
				warningDetails.push({
					filePath: file.path,
					warnings: file.warnings,
					newFilePath: file.newPath
				});
			}

			lineErrors += file.lineErrors.length;
			if (file.lineErrors.length > 0) {
				lineErrorDetails.push({
					filePath: file.path,
					errors: file.lineErrors,
					newFilePath: file.newPath
				});
			}
		});

		report = report.replace("CYPHFELL-VERSION-TEMPLATE", `"${JSON.parse(fs.readFileSync(fp.findLocalFilePath("package.json"), "utf8")).version}"`)
			.replace("SUCCESSFULLY-CONVERTED-TEMPLATE", successfullyConverted)
			.replace("CRITICAL-FAILURES-COUNT-TEMPLATE", criticalErrors.length)
			.replace("TRANSFORM-FAILURES-COUNT-TEMPLATE", lineErrors)
			.replace("TRANSFORM-WARNINGS-COUNT-TEMPLATE", warnings)
			.replace("CONFIG-PROPS-TEMPLATE", JSON.stringify(configToWrite))
			.replace("CRITICAL-FAILURE-DETAILS-TEMPLATE", JSON.stringify(criticalErrors))
			.replace("WARNINGS-TEMPLATE", JSON.stringify(warningDetails))
			.replace("TRANSFORMATION-ERRORS-TEMPLATE", JSON.stringify(lineErrorDetails));

		fs.mkdirsSync(`${process.cwd()}/${options.reportOutputFolder}`);
		fs.writeFileSync(`${process.cwd()}/${options.reportOutputFolder}/cyphfell${new Date().getTime()}.html`, report);
	}

	reset() {
		this.files = [];
	}
}

const instance = new ReportGenerator();
module.exports = instance;