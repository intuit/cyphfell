/**
 * This file keeps track of text that appears in a file to prevent it from being mixed up in some other context. For example, some RegExp conversions
 * may ultimately result in the same function name, causing an infinite loop. This file lets those be temporarily be changed to some other
 * text that will not result in this happening
 */
module.exports = {
	IS_SELECTED: {
		temporary: "isSubjectSelected",
		real: "isSelected"
	},
	ELEMENTID_ATTRIBUTE: {
		temporary: "elementIdAttributeTemp",
		real: "elementIdAttribute"
	},
	ELEMENTID_CSS_PROPERTY: {
		temporary: "elementIdCssPropertyTemp",
		real: "elementIdCssProperty"
	},
	ELEMENTID_DISPLAYED: {
		temporary: "elementIdDisplayedTemp",
		real: "elementIdDisplayed"
	},
	ELEMENTID_ELEMENT: {
		temporary: "elementIdElementTemp",
		real: "elementIdElement"
	},
	ELEMENTID_ENABLED: {
		temporary: "elementIdEnabledTemp",
		real: "elementIdEnabled"
	},
	ELEMENTID_LOCATION: {
		temporary: "elementIdLocationTemp",
		real: "elementIdLocation"
	},
	ELEMENTID_LOCATION_IN_VIEW: {
		temporary: "elementIdLocationInViewTemp",
		real: "elementIdLocationInView"
	},
	ELEMENTID_NAME: {
		temporary: "elementIdNameTemp",
		real: "elementIdName"
	},
	ELEMENTID_SELECTED: {
		temporary: "elementIdSelectedTemp",
		real: "elementIdSelected"
	},
	ELEMENTID_SIZE: {
		temporary: "elementIdSizeTemp",
		real: "elementIdSize"
	},
	ELEMENTID_TEXT: {
		temporary: "elementIdTextTemp",
		real: "elementIdText"
	},
	LOG: {
		temporary: "logTemp",
		real: "log"
	},
	SELECT_BY_ATTRIBUTE: {
		temporary: "selectByAttributeTemp",
		real: "selectByAttribute"
	},
	SELECT_BY_INDEX: {
		temporary: "selectByIndexTemp",
		real: "selectByIndex"
	},
	SUBMIT_FORM: {
		temporary: "submitFormTemp",
		real: "submitForm"
	},
	GET_LOCATION: {
		temporary: "getLocationTemp",
		real: "getLocation"
	},
	GET_HTML: {
		temporary: "getHTMLTemp",
		real: "getHTML"
	},
	GET_LOCATION_IN_VIEW: {
		temporary: "getLocationInViewTemp",
		real: "getLocationInView"
	}
};