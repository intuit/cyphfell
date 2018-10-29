const convertUnicodeToModifiers = (value) => {
	return value.replace(/{/g, "{{}").replace(/\uE003/g, "{backspace}").replace(/\uE017/g, "{del}")
		.replace(/\uE015/g, "{downarrow}").replace(/\uE007/g, "{enter}").replace(/\uE00C/g, "{esc}")
		.replace(/\uE012/g, "{leftarrow}").replace(/\uE014/g, "{rightarrow}").replace(/\uE013/g, "{uparrow}")
		.replace(/\uE00A/g, "{alt}").replace(/\uE009/g, "{ctrl}").replace(/\uE03D/g, "{meta}").replace(/\uE008/g, "{shift}");
};

Cypress.Commands.add("getCssProperty", {prevSubject: "element"}, (subject, cssProperty) => {
	return cy.window().then((window) => {
		return window.getComputedStyle(subject[0])[cssProperty];
	});
});

Cypress.Commands.add("getElementSize", {prevSubject: "element"}, (subject, attr) => {
	if (attr && !attr.includes("client")) {
		attr = attr.substring(0, 1).toUpperCase() + attr.substring(1).toLowerCase();
		attr = "client" + attr;
	}
	const elem = subject[0];
	if (attr) {
		return elem[attr];
	}
	return {
		width: elem.clientWidth,
		height: elem.clientHeight
	};
});

Cypress.Commands.add("getHTML", {prevSubject: "element"}, (subject, outerHTML = true) => {
	return subject[0][outerHTML ? "outerHTML" : "innerHTML"];
});

// note that this command is dependent on the size of the browser window. For this reason, the default Cypress results may not be the same as
// the default WDIO results
Cypress.Commands.add("getLocation", {prevSubject: "element"}, (subject, attr) => {
	const rect = subject[0].getBoundingClientRect();
	return cy.window().then((window) => {
		const coords = {
			x: rect.left + window.scrollX,
			y: rect.top + window.scrollY
		};
		return attr ? coords[attr] : coords;
	});
});

Cypress.Commands.add("getLocationInView", {prevSubject: "element"}, (subject, attr) => {
	const rect = subject[0].getBoundingClientRect();
	const coords = {
		x: Math.floor(rect.left),
		y: Math.floor(rect.top)
	};
	return attr ? coords[attr] : coords;
});

Cypress.Commands.add("getNodeName", {prevSubject: "element"}, (subject) => {
	return subject[0].nodeName.toLowerCase();
});

Cypress.Commands.add("hasFocus", {prevSubject: "element"}, (subject) => {
	return subject.context.activeElement === subject[0];
});

Cypress.Commands.add("isEnabled", {prevSubject: "element"}, (subject) => {
	return subject[0].disabled !== true;
});

Cypress.Commands.add("isExisting", {prevSubject: "optional"}, (subject, selector) => {
	if (selector) {
		return cy.document().then((document) => {
			return !!document.querySelector(selector);
		});
	}
	return true;
});

Cypress.Commands.add("isSelected", {prevSubject: "element"}, (subject) => {
	if (subject[0].nodeName === "OPTION") {
		return Array.prototype.slice.call(subject[0].parentNode.selectedOptions).includes(subject[0]);
	}
	return subject[0].checked === true;
});

Cypress.Commands.add("isVisible", {prevSubject: "optional"}, (subject, selector) => {
	if (selector) {
		return cy.document().then((doc) => {
			const element = doc.querySelector(selector);
			if (!element) {
				return false;
			}
			return Cypress.dom.isVisible(element);
		});
	}
	return Cypress.dom.isVisible(subject);
});

Cypress.Commands.add("getText", {prevSubject: "element"}, (subject) => {
	const domType = subject[0].nodeName.toLowerCase();
	return cy.wrap(subject[0]).invoke((domType === "input" || domType === "textarea") ? "val" : "text");
});

Cypress.Commands.add("waitForEnabled", {prevSubject: "element"}, (subject, timeout = Cypress.config("defaultCommandTimeout"), reverse) => {
	return cy.wrap(subject[0], {timeout: timeout}).should(reverse ? "not.be.enabled" : "be.enabled").then(() => true);
});

Cypress.Commands.add("waitForExist", {prevSubject: "element"}, (subject, timeout, reverse) => {
	// TODO: support for reverse
	if (reverse) {
		console.error("waitForExist with reverse=true is not supported");
		return false;
	}
	return true;
});

Cypress.Commands.add("waitForSelected", {prevSubject: "element"}, (subject, timeout, reverse) => {
	cy.wrap(subject, {timeout: timeout}).should((el) => {
		if (el[0].nodeName === "OPTION") {
			expect(el[0].selected).to.be.equal(!reverse);
		} else {
			expect(el[0].checked).to.be.equal(!reverse);
		}
	});
});

Cypress.Commands.add("waitForText", {prevSubject: "element"}, (subject, timeout, reverse) => {
	return cy.wrap(subject).getText().should(reverse ? "be.equal" : "not.be.equal", "");
});

Cypress.Commands.add("waitForValue", {prevSubject: "element"}, (subject, timeout, reverse) => {
	return cy.wrap(subject).should((el) => {
		const len = el[0].value.length;
		if (reverse) {
			expect(len).to.be.equal(0);
		} else {
			expect(len).to.be.gt(0);
		}
	});
});

Cypress.Commands.add("waitForVisible", {prevSubject: "element"}, (subject, timeout, reverse) => {
	return cy.wrap(subject).should(reverse ? "not.be.visible" : "be.visible");
});

Cypress.Commands.add("getTagName", {prevSubject: "element"}, (subject) => {
	return subject[0].nodeName.toLowerCase();
});

Cypress.Commands.add("setValue", {prevSubject: "element"}, (subject, value) => {
	return cy.wrap(subject).clear().type(value);
});

Cypress.Commands.add("setLocalStorage", (key, value) => {
	return cy.window().then((window) => {
		window.localStorage.setItem(key, value);
	});
});

Cypress.Commands.add("getLocalStorage", (key) => {
	return cy.window().then((window) => {
		return window.localStorage.getItem(key);
	});
});

Cypress.Commands.add("setSessionStorage", (key, value) => {
	return cy.window().then((window) => {
		window.sessionStorage.setItem(key, value);
	});
});

Cypress.Commands.add("getSessionStorage", (key) => {
	return cy.window().then((window) => {
		return window.sessionStorage.getItem(key);
	});
});

Cypress.Commands.add("getAttribute", {prevSubject: "optional"}, (subject, selector, attribute) => {
	if (attribute) {
		if (attribute === "class") {
			attribute = "className";
		}
		return cy.get(selector).then((el) => {
			return cy.wrap(el[0][attribute]);
		});
	}
	if (selector === "class") {
		selector = "className";
	}
	return cy.wrap(subject[0][selector]);
});

Cypress.Commands.add("getAllWDIO", (selector, options = {}) => {
	return cy.get(selector, Object.assign(options, {multiple: true})).then((res) => {
		return {
			value: res
		};
	});
});

Cypress.Commands.add("findSubElements", {prevSubject: "element"}, (subject, selector) => {
	return cy.wrap(subject).find(selector).then((res) => {
		return {
			value: res
		};
	});
});

Cypress.Commands.add("selectByAttribute", {prevSubject: "element"}, (subject, attribute, value) => {
	return cy.wrap(subject).children("option").then((options) => {
		return Array.from(options).find((option) => option.getAttribute(attribute) === value);
	}).then((option) => {
		return option[0].value;
	}).then((value) => {
		cy.wrap(subject).select(value);
	});
});

Cypress.Commands.add("selectByIndex", {prevSubject: "element"}, (subject, index) => {
	return cy.wrap(subject).children("option").then((options) => {
		return options[index].value;
	}).then((value) => {
		cy.wrap(subject).select(value);
	});
});

Cypress.Commands.add("submitForm", {prevSubject: "element"}, (subject) => {
	let current = subject[0];
	while (current && current.nodeName !== "FORM") {
		current = current.parentNode;
	}

	if (current.nodeName === "FORM") {
		return cy.wrap(current).submit();
	}
	return null;
});

Cypress.Commands.add("addValue", {prevSubject: "element"}, (subject, value) => {
	return cy.wrap(subject).type(convertUnicodeToModifiers(value.toString()));
});