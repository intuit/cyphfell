## How does it work?

This module converts automation tests from a supported format (such as WDIO) into Cypress format. All test files will be copied into the integrations folder of the cypress directory, and be renamed to end with `.spec.js` ex: `testFileName.js` becomes `testFileName.spec.js`

Page objects, utilities, custom commands, and config files will also be converted into Cypress format.

The tool will look for any files matching a glob pattern that you provide, and will then convert each file individually and create a new file with converted code based on the original file contents.

For the actual conversion process, [this activity diagram](https://github.com/intuit/cyphfell/raw/master/docs/Cyphfell%20Architecture.png?raw=true) highlights the primary flows. Essentially, there is the core conversion module which moves your old test code into new files, and converts synchronous code into asynchronous code. Regular expression replacements are already made in the module. On top of that, there are various [plugins](https://github.com/intuit/cyphfell/tree/master/packages/cyphfell/src/plugins) that get run. These plugins are passed in an AST representing your code at various parts of the core conversion process, and they can be created to perform arbitrary actions with an AST. This allows the conversion process to be more complete, but some plugins may not be suited for every code base, so those plugins can be deactivated through a configuration option. You can also build your own plugins that do not reside in this repository, and run the conversion process with your plugins active on top of the existing plugins in this repository.

Note that depending on the complexity of your files, the conversion process may take a while.

## Usage steps:

##### Imported Node Module

1. `cd PROJECT_ROOT_DIRECTORY`
1. `yarn add cyphfell -D`
1. Create a file that calls the function exported by [`index.js`](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/index.js) of this project, similar to how [`cli.js`](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/cli.js) does it.
The first argument is any option overrides to use, and the second option is any external AST altering plugins to activate.
1. Run your new file from the command line with
`node PATH_TO_NEW_FILE`

##### CLI

1. `cd PROJECT_ROOT_DIRECTORY`
1. `yarn add cyphfell -D`
1. `$(npm bin) cyphfell -v`

> 📝 **NOTE: If you are using the CLI, make sure to pass in *-v* as an argument. This will generate the `support/index.js` file that allows the conversion to be more complete. Your tests will not run without this.**

### Usage Notes:

If you already have a Cypress folder in your project, the cypressFolder configuration option should point to a **different** location than your current cypress folder. You will then have to modify the support file path in your `cypress.json` file to point to the new generated cypress folder directory's support `index.js` file.

### After Usage:
After the files are generated, there will most likely be additional steps that you will either have to do manually, or create your own plugin to handle. Make sure to run your converted tests and make sure that they have the same output as the original tests. If they are not the same, you will need to manually fix the issues.

Some commands from the old framework's API will be added as custom commands to Cypress directly. Other commands will be added to a global browser object. For WebDriverIO, you can view the custom commands [here](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/src/converters/wdio/WDIOCommands.js), and the global browser functions [here](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/src/converters/wdio/InitializeBrowserFunctions.js).

An HTML report will be generated at the current working directory, under the cyphfell-output folder. This report
will display what configuration options you ran Cyphfell with, and it gives an overview of the conversion process.
If you run into critical errors, or if there are additional steps that you MUST take manually (such as some functions not being possible in Cypress),
they will be highlighted in the report. If you run into issues that you need help debugging, sharing the HTML report will make resolving issues easier.
If there are anti-patterns that you should focus on removing in your code, then they will be highlighted as warnings in the report.

## Options
| Option|CLI Alias|Default Value|Description|
|-----|-|---|------------|
|cypressFolder|`-c`|`test/cypress/`|The relative path from the working directory to the folder to place Cypress converted code into|
|baseNormalFolder|`-b`|`test/`|The relative path to the folder containing your tests|
|enableAssertions|`-a`|`false`|Whether to enable runtime assertions during the conversion process, to detect whether some import-related conversion items are successful|
|glob|`-g`|`${CWD}/test/!(unit|ui-perf|cypress)/**/*.+(js|json)`|A glob pattern that all files to convert much match. ${CWD} is replaced with the current working directory|
|transpile|`-t`|`false`|If you are using some ES6 features such as object spread (...) or static class properties, you must run with this argument set. You must also have **@babel/core**, **@babel/plugin-proposal-object-rest-spread**, and **babel-plugin-transform-class-properties** installed.|
|validateCypressDir|`-v`|`true`|Whether to check for the existence of the cypress folder. If it does not exists, then it will be created, and the tool will copy over it's plugin and support index.js files, as well as custom commands.|
|replaceModuleImport||`(importPath, includeModulesFolder = true) => { return "";}`|A function that transforms an import from the node_modules folder from the new cypress path generated by *transformModuleImportIntoCypress* format into the original path. Returns the new import path if it was changed, or an empty string otherwise. includeModulesFolder determines whether to include node_modules at the start of the returned import path|
|transformModuleImportIntoCypress||`(originalImport) => { return originalImport; }`|A function that transforms an import from the node_modules format into the new cypress path of an imported file. Returns the new import path|
|disabledPlugins||`ArgumentSeparation, TernaryOperator`|The unique IDs of any plugins that should not be enabled when running.|
|framework|`-f`|`wdio`|The framework to convert files from. Possible options: wdio, nightwatch (not supported yet). Import these from [here](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/src/constants/FrameworkConstants.js) instead of entering them directly.|
|eslint|`-e`|`0`|Whether to automatically run eslint --fix on all generated files. If this is set to 0, then do nothing. If this is set to 1, use local eslint. If this is set to 2, use the globally installed eslint. Import these from [here](https://github.com/intuit/cyphfell/blob/master/packages/cyphfell/src/constants/EslintConstants.js)|
|moduleResolvePaths||`${process.cwd()}`, `${process.cwd()}/node_modules`|Paths to attempt to resolve imports from, if the import does not start with a "." character|
|moduleAliases|||List of aliases to look for at the start of an import, and replace if it is found. Each entry in the list consists of: <br/> {alias: String (the text to look for), actual: String (the actual path to that alias) }|
|reportOutputFolder||`cyphfell-output`|The folder to place the generated HTML reports into|
