const esprima = require("esprima"),
	estraverse = require("estraverse"),
	codegen = require("escodegen"),
	fs = require("fs"),
	regexUtil = require("./RegexUtil"),
	babel = require("@babel/core"),
	filePathUtil = require("./FilePathUtil"),
	findTrueImportPath = filePathUtil.findPathWithExtension;

const LOOP_BREAK = "break;",
	REPLACE_LOOP_BREAK = "global.replaceLoopBreak;",
	SUPERCLASS = "super",
	REPLACE_SUPERCLASS = "global.TEMP_SUPER";

const replaceTemporaryStrings = (str) => {
	return str.replace(new RegExp(LOOP_BREAK, "g"), REPLACE_LOOP_BREAK).replace(new RegExp(SUPERCLASS, "g"), REPLACE_SUPERCLASS);
};

const undoReplaceTemporaryStrings = (str) => {
	return str.replace(new RegExp(REPLACE_LOOP_BREAK, "g"), LOOP_BREAK).replace(new RegExp(REPLACE_SUPERCLASS, "g"), SUPERCLASS);
};

const fixSpacing = (str) => {
	return EsprimaUtils.generateCodeFromAST(EsprimaUtils.generateAST(str));
};

const removeExtraSpace = (str) => {
	let tempStr;
	while (true) {
		tempStr = str.replace(/ {2}/g, " ");
		if (tempStr === str) {
			break;
		} else {
			str = tempStr;
		}
	}
	return str.replace(/\n /g, "\n");
};

/**
 * Finds the BlockStatement containing the specified node
 * @param {Object} node - the node to search for
 * @return {Object} - the BlockStatement containing the specified node
 * @precondition - the input node and it's ancestors all have a "parent" key that references their respective parent nodes
 */
const findContainingBlock = (node) => {
	let containingBlock = node;
	while (containingBlock) {
		if (containingBlock.type === "BlockStatement") {
			break;
		}
		containingBlock = containingBlock.parent;
	}
	return containingBlock;
};

const simplifyClosures = (ast) => {
	while (true) {
		let continueLoop = false;
		estraverse.traverse(ast, {
			enter: (node) => {
				if (continueLoop) {
					return;
				}
				if (node.callee && node.callee.object && node.callee.object.type === "CallExpression" &&
                    node.callee.property && node.callee.object.callee.property && node.callee.property.name === "then" &&
                    node.arguments[0].type === "ArrowFunctionExpression" && !EsprimaUtils.generateCodeFromAST(node).includes("return ")) {
					const varName = node.arguments[0].params[0].name;
					const thenBlock = node.arguments[0].body;

					const containingBlock = findContainingBlock(node);
					const indicesToRemove = [];
					const usingIndices = [];
					const usingVariables = [];
					thenBlock.body.forEach((child, index) => {
						const childCode = EsprimaUtils.generateCodeFromAST(child);
						if (!childCode.includes(varName) && !usingVariables.some((variable) => childCode.includes(variable))) {
							indicesToRemove.push(index);
						} else {
							usingIndices.push(index);
							if (child.type === "VariableDeclaration") {
								child.declarations.forEach((decl) => {
									if (decl.type === "VariableDeclarator") {
										usingVariables.push(decl.id.name);
									}
								});
							} else if (child.type === "ExpressionStatement" && child.expression.type === "AssignmentExpression" &&
                                child.expression.operator === "=") {
								if (child.expression.left.type === "MemberExpression") {
									EsprimaUtils.generateCodeFromAST(child.expression.left).split(".").forEach((lvalue) => {
										usingVariables.push(lvalue);
									});
								} else if (child.expression.left.type === "Identifier") {
									usingVariables.push(child.expression.left.name);
								}
							}
						}
					});
					const removeIndicesAfter = usingIndices.length > 0 ? Math.max(...usingIndices) : -1;
					indicesToRemove.filter((index) => index > removeIndicesAfter).forEach((index, i) => {
						containingBlock.body.push(thenBlock.body[index - i]);
						thenBlock.body.splice(index - i, 1);
						continueLoop = true;
					});
				}
			}
		});
		if (!continueLoop) {
			break;
		}
	}
};

/**
 * Adjusts a file import by adding an extension to the end of it if needed
 * @param {Object} node - the AST node to adjust
 * @param {String?} requirePath - if this node is a require statement, then the path to import will be passed in to this parameter. Otherwise, this should be null
 */
const sanitizeImport = (node, requirePath) => {
	let importPath = requirePath || node.source.value;
	if (importPath.startsWith(".") || importPath.startsWith(options.baseNormalFolder)) {
		importPath = findTrueImportPath(importPath);
	}
	if (requirePath) {
		node.arguments[0].value = importPath;
		node.arguments[0].raw = `${importPath}`;
	} else {
		node.source.value = importPath;
		node.source.raw = `"${importPath}"`;
	}
};

/**
 * Loads all methods in the specified file's contents (and superclasses) into the map parameter
 * @param {String} importPath - the path (Cypress replaced, or original) to the import file
 * @param {Map<String, String>} map - map of each function name to the function's code
 */
const loadImportMethods = (importPath, map) => {
	const contents = fixSpacing(fs.readFileSync(importPath.replace(options.cypressFolder, options.baseNormalFolder), "utf8"));
	const importAst = EsprimaUtils.generateAST(contents);
	const classDeclarations = [];
	const imports = [];
	estraverse.traverse(importAst, {
		enter: (node, parent) => {
			if (node.type === "MethodDefinition") {
				map.set(node.key.name, EsprimaUtils.generateCodeFromAST(node));
			} else if (node.type === "ClassDeclaration") {
				classDeclarations.push(node.id.name);
				if (node.superClass) {
					const loadSuperClass = (scName) => {
						const importFrom = imports.find((possibleImport) => possibleImport.specifier === scName);
						if (importFrom) {
							loadImportMethods(importFrom.path, map);
						}
					};
					if (node.superClass.name) {
						loadSuperClass(node.superClass.name);
					} else if (node.superClass.type === "CallExpression") {
						// multiple inheritance assumed
						node.superClass.arguments.forEach((arg) => {
							loadSuperClass(arg.name);
						});
					}
				}
			} else if (node.type === "ImportDeclaration" && node.specifiers.length === 1) {
				imports.push({
					specifier: node.specifiers[0].local.name,
					path: findTrueImportPath(filePathUtil.findAbsolutePathToImport(importPath, node.source.value))
				});
			} else if (EsprimaUtils.isRequireStatement(node)) {
				if (parent && parent.type === "VariableDeclarator") {
					imports.push({
						specifier: parent.id.name,
						path: findTrueImportPath(filePathUtil.findAbsolutePathToImport(importPath, EsprimaUtils.isRequireStatement(node)))
					});
				}
			}
		}
	});
};

/**
 * Attempts to move all nodes following the specified node from their common block to a .then() statement inside of the specified node
 * @param {Object} node - the CallExpression AST node to serve as the new parent of all following nodes if it should have a .then() chained to the end of it
 * @param {Map<String, Number>} timesUsed - maps each function name to the number of times it was called
 * @param {function} filterCallback - callback function that determines whether a specified function should have a .then statement chained to the end of it
 * @param {Map<String, String>} variables - maps each declared variable name to the name of the imported identifier that it is an instance of
 * @return {boolean} - whether nodes were moved
 */
const formClosure = (node, timesUsed, filterCallback, variables) => {
	let continueLoop = false;
	const code = EsprimaUtils.generateCodeFromAST(node);
	const noChainCall = node.callee.object && ((node.callee.object.type === "Identifier" || node.callee.object.type === "ThisExpression") && filterCallback(code, node.callee.object.name, node.callee.property.name, variables));
	const chainedCall = node.callee.object && node.callee.object.type === "CallExpression" && node.callee.property && node.callee.object.callee.property && !String.prototype[node.callee.property.name] && node.callee.property.name !== "then" && filterCallback(code, node.callee.object.callee.object.name, node.callee.object.callee.property.name, variables);
	// TODO: cy.get(...).find(...)
	// TODO: returning browser.element() in a function call
	const browserElement = node.callee.object && (node.callee.object.name === "cy" && node.callee.property.name === "get") && node.parent.type === "VariableDeclarator";

	if (noChainCall || chainedCall || browserElement) {
		const containingBlock = findContainingBlock(node);

		// find the node in the block statement containing this node
		let topLevelNode;
		for (let i = 0; i < containingBlock.body.length; ++i) {
			if (containingBlock.body[i].index >= node.index) {
				topLevelNode = containingBlock.body[i - 1];
				topLevelNode.bodyIndex = i - 1;
				break;
			} else if (containingBlock.body[i].index) {
				topLevelNode = containingBlock.body[i];
				topLevelNode.bodyIndex = i;
			}
		}

		if (!EsprimaUtils.generateCodeFromAST(topLevelNode).includes(code) && EsprimaUtils.generateCodeFromAST(containingBlock.body[topLevelNode.bodyIndex - 1]).includes(code) &&
            topLevelNode.bodyIndex > 0) {
			topLevelNode = containingBlock.body[topLevelNode.bodyIndex - 1];
		}
		// modify the top level node to insert a closure for the current node
		const funcName = node.callee.property.name;
		const timesFuncUsed = timesUsed.has(funcName) ? timesUsed.get(funcName) : 1;
		const varName = `${funcName}${timesFuncUsed}`;
		const blockClone = Object.assign({}, containingBlock);
		blockClone.body = blockClone.body.slice(topLevelNode.bodyIndex);

		let replacement = replaceTemporaryStrings(removeExtraSpace(EsprimaUtils.generateCodeFromAST(blockClone)).replace(removeExtraSpace(code), varName));
		// fix some cases when: const x = browser.doSomething(); if (x) { ... } results in: const x = browser.doSomething(); browser.doSomething().then((doSomething1) => {...});
		if (node.parent.type === "VariableDeclarator" && node.parent.id.name && !replacement.includes(`${node.parent.id.name} = ${varName}`)) {
			replacement = replacement.replace(new RegExp(regexUtil.formatRegex(node.parent.id.name), "g"), varName);
		}

		let newText = `${code}.then((${varName}) => ${replacement});`;
		const infiniteStackRegex = new RegExp(regexUtil.formatRegex(funcName) + "[0-9]+" + regexUtil.formatRegex(".then(" + funcName) + "[0-9]+", "g");

		if (newText.includes(`${varName}.then(${varName} => `) || newText.match(infiniteStackRegex) ||
            removeExtraSpace(newText).endsWith(`.then((${varName}) => {\n${varName};\n});`)) {
			return;
		}

		timesUsed.set(funcName, timesFuncUsed + 1);
		containingBlock.body[topLevelNode.bodyIndex] = EsprimaUtils.generateAST(newText).body[0];//esprima.parse(newText).body[0];
		containingBlock.body[topLevelNode.bodyIndex].visited = true;

		// if something inside the closure has a return statement, add a return statement to the closure expression
		if (newText.includes("return ")) {
			containingBlock.body[topLevelNode.bodyIndex] = {
				argument: containingBlock.body[topLevelNode.bodyIndex],
				type: "ReturnStatement",
				parent: containingBlock.body[topLevelNode.bodyIndex].parent,
				visited: true
			};
		}
		node.visited = true;
		continueLoop = true;
		// ignore everything in the block after the closure because it has been moved inside
		containingBlock.body = containingBlock.body.slice(0, topLevelNode.bodyIndex + 1);
	}
	return continueLoop;
};

class EsprimaUtils {

	static generateCodeFromAST(ast) {
		return undoReplaceTemporaryStrings(codegen.generate(ast, {format: {quotes: "double"}}));
	}

	static generateAST(str, includeLineNumbers = false) {
		str = replaceTemporaryStrings(str);
		if (global.options && options.transpile) {
			str = babel.transformSync(str, {
				babelrc: false,
				plugins: [
					"@babel/plugin-proposal-object-rest-spread",
					"transform-class-properties"
				]
			}).code;
		}
		const astOptions = {sourceType: "module"};
		if (includeLineNumbers) {
			Object.assign(astOptions, {loc: true});
		}

		let ast;
		try {
			ast = esprima.parse(str, astOptions);
		} catch (ex) {
			ast = esprima.parse(`function ${str.replace("static ", "")}`, astOptions);
		}

		for (const node of ast.body) {
			const requireStatement = EsprimaUtils.isRequireStatement(node);
			if ((node.type === "ImportDeclaration" && node.source && node.source.type === "Literal") || requireStatement) {
				sanitizeImport(node, requireStatement);
			}
		}
		return ast;
	}

	static fixInconsistentSpacing(str) {
		return fixSpacing(str);
	}

	/**
     * Gets the source code of the specified imported function
     * @param {String} str - the source code of the current file
     * @param {String} className - the name of the class to import from
     * @param {String} funcName - the name of the function to get the source code of
     * @param {String} currentDir - the directory of the current file
     * @param {Map<String, Map<String, String>>} allImports - Maps each import absolute path --> (function name --> function definition code)
     * @return {String} - the matching function's code if found, or an empty string otherwise
     */
	static getImportSourceCode(str, className, funcName, currentDir, allImports) {
		const findSource = (importPath) => {
			const finalImportPath = filePathUtil.findAbsolutePathToImport(currentDir, importPath);

			try {
				if (importPath.includes(".json") || finalImportPath.includes(".json")) {
					return "";
				}
			} catch (ex) {
				// do nothing
			}

			if (allImports.get(finalImportPath)) {
				return allImports.get(finalImportPath).get(funcName);
			} else {
				try {
					const newMap = new Map();
					loadImportMethods(finalImportPath, newMap);
					allImports.set(finalImportPath, newMap);
					return newMap.get(funcName) || "";
				} catch (ex) {
					return "";
				}
			}
		};
		const ast = this.generateAST(str);
		for (const node of ast.body) {
			if (node.type === "ImportDeclaration") {
				if (node.specifiers.some((alias) => (alias.local.name === className))) {
					return findSource(node.source.raw.replace(/"/g, "").replace(";", ""));
				}
			} else if (node.type === "VariableDeclaration") {
				for (const declarator of node.declarations) {
					if (declarator.init && this.isRequireStatement(declarator.init) && className === declarator.id.name) {
						return findSource(this.isRequireStatement(declarator.init));
					}
				}
			}
		}
		//throw new Error(`Could not find import source code for import: ${className} in \n ${currentDir}`);
		return "";
	}

	static modifyReturnFunctions(str, filterCallback) {
		const ast = this.generateAST(str);
		/**
         * Maps each function name to how many times it was called in a .then() format
         * @type {Map<String, Number>}
         */
		const timesUsed = new Map();
		/**
         * Map each declared variable name to the class the variable represents
         * @type {Map<String, String>}
         */
		const variables =  new Map();
		while (true) {
			let nodeIndex = 0;
			let continueLoop = false;
			estraverse.traverse(ast, {
				enter: (node, parent) => {
					node.parent = parent;
					node.index = ++nodeIndex;
					if (continueLoop || node.visited) {
						return;
					}
					if (node.type === "VariableDeclarator" && node.init && node.init.type === "NewExpression" && node.init.callee.type === "Identifier") {
						variables.set(node.id.name, node.init.callee.name);
					}
					if (node.type === "AssignmentExpression" && node.operator === "=" && node.left.type === "Identifier" && node.right.type === "NewExpression" && node.right.callee.type === "Identifier") {
						variables.set(node.left.name, node.right.callee.name);
					}
					if (node.type === "CallExpression") {
						continueLoop = formClosure(node, timesUsed, filterCallback, variables);
					}
				}
			});
			if (!continueLoop) {
				break;
			}
		}

		simplifyClosures(ast);
		return this.generateCodeFromAST(ast);
	}

	static getFunctionSource(str, funcName) {
		const ast = this.generateAST(str);
		let value = "";
		estraverse.traverse(ast, {
			enter: (node) => {
				if (node.type === "MethodDefinition" && node.key.name === funcName) {
					value = this.generateCodeFromAST(node);
				}
			}
		});
		return value;
	}

	/**
	 * Finds the BlockStatement containing the specified node
	 * @param {Object} node - the node to search for
	 * @return {Object} - the BlockStatement containing the specified node
	 * @precondition - the input node and it's ancestors all have a "parent" key that references their respective parent nodes
	 */
	static findBlock(node) {
		return findContainingBlock(node);
	}

	/**
	 * Finds the node at the top level of a block statement that contains the specified node
	 * @param {Object} node - the node to find a top level node for
	 * @return {Object} - the top level node containing the specified node
	 * @precondition - the input node and it's ancestors all have a "parent" key that references their respective parent nodes
	 */
	static findTopLevelNode(node) {
		let current = node;
		let previous = node;
		while (current) {
			if (current.type === "BlockStatement") {
				break;
			}
			previous = current;
			current = current.parent;
		}
		return previous;
	}

	/**
     * Gets the name of the function invoked on an identifier, and the identifier's name
     * @param {Object} callExpression - the AST node representing the Call Expression
     * @return {Object} - {identifer: identifier the function was invoked on, property: the function invoked}
     * @example cy.get(".abc") returns {identifier: "cy", property: "get"}
     * @example cy.get(".abc").click() returns {identifier: "cy", property: "click"}
     * @example x.y.something() returns {identifier: null, property: null}
     */
	static getCallExpressionDetails(callExpression) {
		const noChainCall = callExpression.callee.object && (callExpression.callee.object.type === "Identifier" || callExpression.callee.object.type === "ThisExpression");
		const chainedCall = callExpression.callee.object && callExpression.callee.object.type === "CallExpression" && callExpression.callee.property && callExpression.callee.object.callee.property;
		if (noChainCall) {
			return {
				identifier: callExpression.callee.object.name,
				property: callExpression.callee.property.name
			};
		} else if (chainedCall) {
			return {
				identifier: callExpression.callee.object.callee.object.name,
				property: callExpression.callee.object.callee.property.name
			};
		}
		return {identifier: null, property: null};
	}

	static isFunctionStartNode(node) {
		return node.type === "MethodDefinition" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
	}

	/**
	 * Gets whether the specified node represents a require("") statement with a string literal as it's first parameter
	 * @param {Object} node - the AST node ot check
	 * @return {String?} - returns the path the require statement is importing if the node is a requirement statement, or null otherwise
	 */
	static isRequireStatement(node) {
		if (node.type === "CallExpression" && node.callee && node.callee.name === "require" && node.arguments[0] && node.arguments[0].type === "Literal") {
			return node.arguments[0].value;
		}
		return null;
	}

	/**
	 * Gets whether the specified node represents a .then() statement chained onto the end of a function call
	 * @param {Object} node - the node to check
	 * @return {boolean} - whether the node represents a then statement
	 */
	static isThenStatement(node) {
		return Boolean(node.callee && node.callee.object && node.callee.object.type === "CallExpression" &&
			node.callee.property && node.callee.object.callee.property && node.callee.property.name === "then");
	}

	/**
	 * Regenerates the given AST to account for an issue where an extra semicolon gets generated
	 * @param {Object} ast - the AST to regenerate
	 * @return {Object} - the regenerated AST
	 */
	static regenerateAST(ast) {
		return this.generateAST(this.generateCodeFromAST(ast));
	}
}

module.exports = EsprimaUtils;