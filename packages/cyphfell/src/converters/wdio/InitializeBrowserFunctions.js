const initWaitFunctions = (obj) => {
	obj.waitForEnabled = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		return cy.get(selector, {log: false}).waitForEnabled(ms, reverse);
	};

	obj.waitForExist = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		return cy.get(selector, {log: false}).waitForExist(ms, reverse);
	};

	obj.waitForSelected = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		cy.get(selector, {log: false}).waitForSelected(ms, reverse);
	};

	obj.waitForText = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		return cy.get(selector, {timeout: ms, log: false}).getText().should(reverse ? "be.equal" : "not.be.equal", "");
	};

	obj.waitForValue = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		return cy.get(selector, {timeout: ms, log: false}).waitForValue(ms, reverse);
	};

	obj.waitForVisible = (selector, ms = Cypress.config("defaultCommandTimeout"), reverse) => {
		return cy.get(selector, {timeout: ms, log: false}).should(reverse ? "not.be.visible" : "be.visible").then(() => !reverse);
	};

	// TODO: integrate interval and timeoutMsg
	obj.waitUntil = (condition, ms = Cypress.config("defaultCommandTimeout"), timeoutMsg = "", interval = 500) => {
		if (Promise.resolve(condition) === condition) {
			const object = {
				resultSet: false
			};

			condition.then(() => {
				object.resultSet = true;
			});
			return cy.wrap(object, {timeout: 60000, log: false}).its("resultSet").should("be.true");
		}

		return cy.wrap(null, {timeout: ms, log: false}).should(() => {
			expect(!!condition()).to.be.equal(true);
		});
	};
};

const initUtilFunctions = (obj) => {
	obj.call = (promiseFn) => {
		const object = {
			result: null,
			resultSet: false
		};
		promiseFn().then((res) => {
			object.result = res;
			object.resultSet = true;
		}).catch((err) => {
			object.result = err;
			object.resultSet = true;
		});
		cy.wrap(object, {timeout: 60000, log: false}).its("resultSet").should("be.true");
		return cy.wrap(object, {timeout: 60000}).its("result");
	};

	obj.execute = (fn, ...rest) => {
		return cy.window().then((window) => {
			const result = fn.apply(this, rest);
			return cy.wrap(result ? result : null, {log: false});
		});
	};

	obj.addCommand = (name, fn) => {
		obj[name] = fn;
		return cy.wrap(null, {log: false});
	};

	obj.setCookie = (cookie) => {
		cy.setCookie(cookie.name, cookie.value);
	};

	obj.localStorage = (method, value) => {
		if (method === "POST") {
			cy.setLocalStorage(value.key, value.value);
		} else {
			return cy.getLocalStorage(value).then((res) => {
				return {
					key: value,
					value: res
				};
			});
		}
	};

	obj.sessionStorage = (method, value) => {
		if (method === "POST") {
			cy.setSessionStorage(value.key, value.value);
		} else {
			return cy.getSessionStorage(value).then((res) => {
				return {
					key: value,
					value: res
				};
			});
		}
	};

	// TODO: implement this
	obj.timeouts = () => {
	};
};

const initActionFunctions = (obj) => {
	obj.setValue = (selector, value) => {
		cy.get(selector, {log: false}).setValue(value);
	};
	obj.getAttribute = (selector, attribute) => {
		return cy.getAttribute(selector, attribute);
	};
	// TODO: account for windowHandle as the first parameter
	// TODO: keep track of current viewport size
	/*obj.windowHandleSize = (obj) => {
        if (!obj) {
            return {
                width: Cypress.config().viewportWidth,
                height: Cypress.config().viewportHeight
            };
        } else {
            cy.viewport(obj.width, obj.height);
        }
    };*/
};

const initEventFunctions = (obj) => {
	const allListeners = new Map();
	obj.on = (eventName, listener, options = false) => {
		const details = {
			listener: listener,
			options: options
		};

		if (!allListeners.has(eventName)) {
			allListeners.set(eventName, [details]);
		} else {
			allListeners.get(eventName).push(details);
		}

		cy.document().then((document) => {
			document.body.addEventListener(eventName, listener, options);
		});
	};
	obj.once = (eventName, listener) => {
		obj.on(eventName, listener, {once: true});
	};
	obj.removeListener = (eventName, listener) => {
		cy.document().then((document) => {
			const found = allListeners.get(eventName).find((list) => list.listener === listener);
			document.body.removeEventListener(eventName, listener, found.options);
		});
	};
	obj.removeAllListeners = (eventName) => {
		if (allListeners.has(eventName)) {
			allListeners.get(eventName).forEach((listener) => {
				obj.removeListener(eventName, listener.listener, listener.options);
			});
			cy.wrap(null).then(() => {
				allListeners.set(eventName, []);
			});
		}
	};
};

const initElementIdFunctions = (obj) => {
	obj.elementIdAttribute = (element, attribute) => {
		return cy.wrap(element, {log: false}).getAttribute(attribute).then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdCssProperty = (element, attribute) => {
		return cy.wrap(element, {log: false}).getCssProperty(attribute).then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdDisplayed = (element) => {
		return cy.wrap(element, {log: false}).isVisible().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdElement = (element, selector) => {
		return cy.wrap(element, {log: false}).findFirst(selector).then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdElements = (element, selector) => {
		return cy.wrap(element, {log: false}).find(selector).then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdEnabled = (element) => {
		return cy.wrap(element, {log: false}).isEnabled().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdLocation = (element) => {
		return cy.wrap(element, {log: false}).getLocation().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdLocationInView = (element) => {
		return cy.wrap(element, {log: false}).getLocationInView().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdName = (element) => {
		return cy.wrap(element, {log: false}).getNodeName().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdSelected = (element) => {
		return cy.wrap(element, {log: false}).isSelected().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdSize = (element) => {
		return cy.wrap(element, {log: false}).getElementSize().then((res) => {
			return {
				value: res
			};
		});
	};

	obj.elementIdText = (element) => {
		return cy.wrap(element, {log: false}).getText().then((res) => {
			return {
				value: res
			};
		});
	};
};

const initFunctions = (obj) => {
	initWaitFunctions(obj);
	initUtilFunctions(obj);
	initActionFunctions(obj);
	initEventFunctions(obj);
	initElementIdFunctions(obj);
};

/**
 * Initializes default configuration properties
 * @param {Object} obj - the browser object
 */
const initDefaultConfig = (obj) => {
	obj.desiredCapabilities = {
		browserName: "chrome"
	};
	obj.options = {
		before: [],
		beforeTest: [],
		afterTest: [],
		beforeCommand: [],
		afterCommand: [],
		beforeSuite: [],
		afterSuite: [],
		after: [],
		beforeHook: [],
		afterHook: []
	};
};

const initializeCypressHooks = (obj) => {
	Cypress.on("test:before:run", (e) => {
		obj.options.beforeTest.forEach((fn) => {
			fn(e);
		});
	});

	Cypress.on("test:after:run", (e) => {
		e.passed = e.state !== "failed";
		obj.options.afterTest.forEach((fn) => {
			fn(e);
		});
	});

	Cypress.on("mocha", (e, params) => {
		if (e === "suite") {
			if (params.title !== "") {
				obj.options.beforeSuite.forEach((fn) => {
					fn(params);
				});
			}
		} else if (e === "suite end") {
			if (params.title !== "") {
				obj.options.afterSuite.forEach((fn) => {
					fn(params);
				});
			}
		} else if (e === "end") {
			obj.options.after.forEach((fn) => {
				fn();
			});
		} else if (e === "hook") {
			obj.options.beforeHook.forEach((fn) => {
				fn();
			});
		} else if (e === "hook end") {
			obj.options.afterHook.forEach((fn) => {
				fn();
			});
		} else if (e === "start") {
			obj.options.before.forEach((fn) => {
				fn();
			});
		}
	});

	Cypress.on("command:start", (e) => {
		obj.options.beforeCommand.forEach((fn) => {
			fn(e.attributes.name, e.attributes.args);
		});
	});

	Cypress.on("command:end", (e) => {
		obj.options.afterCommand.forEach((fn) => {
			fn(e.attributes.name, e.attributes.args);
		});
	});
};

module.exports = {
	/**
     * Initializes WDIO browser commands under a global browser object
     * @param {String?} objectName - the name of the object to place commands under --> by default, it will be "browser"
     * ex: objectName = client  --> use client.waitForVisible()
     */
	init: (objectName) => {
		const browser = {};
		global[objectName] = browser;
		initFunctions(browser);
		initDefaultConfig(browser);
		initializeCypressHooks(browser);
	},
	/**
     * Initializes the WDIO config
     * @param {Object} obj - the global browser object
     * @param {Object} config - the WDIO config
     */
	initConfig: (obj, config) => {
		Object.keys(config).forEach((prop) => {
			if (typeof config[prop] === "function") {
				obj.options[prop] = [config[prop]];
			} else {
				obj.options[prop] = config[prop];
			}
		});
	},
	/**
	 * Assigns the console to the global browser object
	 * @param {Object} obj - the global browser object
	 * @param {Array<Object>} spies - the list of console spies in the form: {level: the log verbosity level, spy: the sinon spy object}
	 */
	initConsoleLog: (obj, spies) => {
		obj.log = () => {
			const completeLog = [];
			spies.forEach((spy) => {
				spy.spy.getCalls().forEach((call) => {
					completeLog.push({
						level: spy.level,
						message: call.args[0]
					});
				});
			});
			return cy.wrap({value: completeLog});
		};
	}
};