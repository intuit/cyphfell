const temp = require("./TemporaryRegexReplacements");

module.exports = [
	{
		from: "browser.element(param)",
		to: "cy.get(${param1})",
		browserOnly: true
	}, {
		from: "browser.$(param)",
		to: "cy.get(${param1})",
		browserOnly: true
	}, {
		from: "browser.$$(param)",
		to: "cy.getAll(${param1})",
		browserOnly: true
	}, {
		from: ".element(param)",            // browser.element(...).element(...)
		to: ".findFirst(${param1})"
	}, {
		from: "browser.elementIdElement(param,param)",
		to: "browser." + temp.ELEMENTID_ELEMENT.temporary + "(${param1},${param2})",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.clearElement(param)",
		to: "cy.get(${param1}).clear()"
	}, {
		from: "browser.elementIdClear(param)",
		to: "cy.wrap(${param1}).clear()",
		browserOnly: true
	}, {
		from: "browser.doubleClick(param)",
		to: "cy.get(${param1}).dblclick()"
	}, {
		from: ".dragAndDrop(",
		//to: ".trigger("   // TODO: a cypress way of doing this
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.leftClick(param,param,param)",
		to: "cy.get(${param1}).click(${param2}, ${param3})"
	}, {
		from: "browser.click(param)",
		to: "cy.get(${param1}).click()",
		browserOnly: true
	}, {
		from: "browser.elementIdClick(param)",
		to: "cy.wrap(${param1}).click()",
		browserOnly: true
	}, {
		from: "browser.middleClick(param,param,param)",
		to: "cy.get(${param1}).click(${param2}, ${param3})"        // TODO: a cypress way of doing this
	}, {
		from: "browser.rightClick(param,param,param)",
		to: "cy.get(${param1}).click(${param2}, ${param3})"        // TODO: a cypress way of doing this
	}, {
		from: "browser.moveToObject(param,rest)",
		//to: "cy.get(${param1}).trigger(\"mouseOver\")"     // TODO: cypress way
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.selectByAttribute(param,param,param)",
		to: "cy.get(${param1})." + temp.SELECT_BY_ATTRIBUTE.temporary + "(${param2}, ${param3})"
	}, {
		from: "browser.selectByIndex(param,param)",
		to: "cy.get(${param1})." + temp.SELECT_BY_INDEX.temporary + "(${param2})"
	}, {
		from: "browser.selectByValue(param,param)",
		to: "cy.get(${param1}).select(${param2})"
	}, {
		from: "browser.selectByVisibleText(param,param)",
		to: "cy.get(${param1}).select(${param2})"
	}, {
		from: "browser.setValue(param,param)",
		to: "cy.get(${param1}).setValue(${param2})",
		browserOnly: true
	}, {
		from: "browser.addValue(param,param)",
		to: "cy.get(${param1}).addValue(${param2})",
		browserOnly: true
	}, {
		from: "browser.submitForm(param)",
		to: "cy.get(${param1})." + temp.SUBMIT_FORM.temporary + "()"
	}, {
		from: "browser.deleteCookie()",
		to: "cy.clearCookies()",
		browserOnly: true
	}, {
		from: "browser.deleteCookie(param)",
		to: "cy.clearCookie(${param1})",
		browserOnly: true
	}, {
		from: "browser.getCookie()",
		to: "cy.getCookies()",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.getCookie(param)",
		to: "cy.getCookie(${param1})",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.getAttribute(param,param)",
		to: "cy.get(${param1}).getAttribute(${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdAttribute(param,param)",
		to: "browser." + temp.ELEMENTID_ATTRIBUTE.temporary + "(${param1},${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdProperty(param,param)",
		to: "browser." + temp.ELEMENTID_ATTRIBUTE.temporary + "(${param1},${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getCssProperty(param,param)",
		to: "cy.get(${param1}).getCssProperty(${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdCssProperty(param,param)",
		to: "browser." + temp.ELEMENTID_CSS_PROPERTY.temporary + "(${param1},${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getElementSize(param,param)",
		to: "cy.get(${param1}).getElementSize(${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdSize(param)",
		to: "browser." + temp.ELEMENTID_SIZE.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getHTML(param)",
		to: "cy.get(${param1})." + temp.GET_HTML.temporary + "(true)",
		returnValue: true
	}, {
		from: "browser.getHTML(param,param)",
		to: "cy.get(${param1})." + temp.GET_HTML.temporary + "(${param2})",
		returnValue: true
	}, {
		from: "browser.getLocation(param)",
		to: "cy.get(${param1})." + temp.GET_LOCATION.temporary + "()",
		returnValue: true
	}, {
		from: "browser.elementIdLocation(param)",
		to: "browser." + temp.ELEMENTID_LOCATION.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getLocation(param,param)",
		to: "cy.get(${param1})." + temp.GET_LOCATION.temporary + "(${param2})",
		returnValue: true
	}, {
		from: "browser.getLocationInView(param,param)",
		to: "cy.get(${param1})." + temp.GET_LOCATION_IN_VIEW.temporary + "(${param2})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getLocationInView(param)",
		to: "cy.get(${param1})." + temp.GET_LOCATION_IN_VIEW.temporary + "()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdLocationInView(param)",
		to: "browser." + temp.ELEMENTID_LOCATION_IN_VIEW.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getTagName(param)",
		to: "cy.get(${param1}).getTagName()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdName(param)",
		to: "browser." + temp.ELEMENTID_NAME.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getText(param)",
		to: "cy.get(${param1}).getText()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdText(param)",
		to: "browser." + temp.ELEMENTID_TEXT.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.getTitle()",
		to: "cy.title()",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.url()",
		to: "cy.url()",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.url(param)",
		to: "cy.visit(${param1})",
		browserOnly: true
	}, {
		from: "browser.getUrl()",
		to: "cy.url()",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.getValue(param)",
		to: "cy.get(${param1}).invoke(\"val\")",
		returnValue: true
	}, {
		from: "browser.hasFocus(param)",
		to: "cy.get(${param1}).hasFocus()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.isEnabled(param)",
		to: "cy.get(${param1}).isEnabled()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdEnabled(param)",
		to: "browser." + temp.ELEMENTID_ENABLED.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.isExisting(param)",
		to: "cy.isExisting(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: ".isSelected()",
		to: "." + temp.IS_SELECTED.temporary + "()",
		returnValue: true
	}, {
		from: "browser.isSelected(param)",
		to: "cy.get(${param1})." + temp.IS_SELECTED.temporary + "()",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdSelected(param)",
		to: "browser." + temp.ELEMENTID_SELECTED.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.isVisible(param)",
		to: "cy.isVisible(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.elementIdDisplayed(param)",
		to: "browser." + temp.ELEMENTID_DISPLAYED.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.isVisibleWithinViewport(param)",
		/*to: "cy.get(${param1}).each(($el) => {})",       // TODO: a cypress way of doing this
        returnValue: true,*/
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.scroll(param)",
		to: "cy.get(${param1}).scrollTo()"
	}, {
		from: "browser.scroll(param,param)",
		to: "cy.get(${param1}).scrollTo(${param2})"
	}, {
		from: "browser.scroll(param,param,param)",
		to: "cy.get(${param1}).scrollTo(${param2}, ${param3})"
	}, {
		from: "browser.pause(",
		to: "cy.wait(",
		browserOnly: true
	}, {
		from: "browser.chooseFile(param,param)",
		//to: "cy.readFile(${param2}).then((contents) => {cy.get(${param1}).type(contents);})"          // TODO: a cypress way of doing this
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.debug()",
		to: "debugger",
		browserOnly: true
	}, {
		from: "browser.refresh()",
		to: "cy.reload()",
		browserOnly: true
	}, {
		from: "browser.elementIdRect",
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.elementIdScreenshot",
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}, {
		from: "browser.elements(param).value",
		to: "cy.getAll(${param1})",
		browserOnly: true
	}, {
		from: "browser.elementIdElements(param,param)",
		to: "cy.wrap(${param1}).find(${param2})",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.elements(param)",
		to: "cy.getAllWDIO(${param1})",
		browserOnly: true
	}, {
		from: ".elements(param)",
		to: ".findSubElements(${param1})"
	}, {
		from: "browser.keys(param)",
		to: "cy.focused().type(\"{\" + ${param1}.toLowerCase() + \"}\")",
		browserOnly: true
	}, {
		from: "browser.elementIdValue(param,param)",
		to: "cy.wrap(${param1}).type(${param2}.flat().join(''))",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.saveScreenshot(param)",
		to: "cy.screenshot(${param1})",
		browserOnly: true
	}, {
		from: "browser.isMobileView()",
		to: "false",
		browserOnly: true
	}, {
		from: "\"Escape\".toLowerCase()",
		to: "\"esc\""
	}, {
		from: "\"escape\".toLowerCase()",
		to: "\"esc\""
	}, {
		from: "browser.elementActive()",
		to: "cy.focused()",
		browserOnly: true,
		returnValue: true
	}, {
		from: "browser.log(param)",
		to: "browser." + temp.LOG.temporary + "(${param1})",
		returnValue: true,
		browserOnly: true
	}, {
		from: "browser.switchTab(param)",
		errorCondition: "true",
		errorMessage: "Cypress does not have support for multiple tabs. You can read more here: https://docs.cypress.io/guides/references/trade-offs.html#Multiple-tabs"
	}, {
		from: "browser.logTypes()",
		errorCondition: "true",
		errorMessage: "There is no Cypress equivalent of this command"
	}

	/*, {
        from: "browser.windowHandleSize(param)",
        to: "browser.setViewportSize(param)",
        browserOnly: true,
        returnValue: true
    }, {
        from: "browser.windowHandleSize(param,param)",
        to: "browser.setViewportSize(param,param)",
        browserOnly: true,
        returnValue: true
    }*/
];
