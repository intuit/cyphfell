const cypressArrayFunc = (array, callback, methodName) => {
	const evaluated = [];
	return cy.wrap(array).each((arg, i) => {
		const res = callback(arg);
		try {
			return res.then((res) => {
				evaluated[i] = res;
			});
		} catch (ex) {
			evaluated[i] = res;
			return true;
		}
	}).then(() => {
		if (methodName === "find") {
			return array.find((item, index) => evaluated[index]) || null;
		}
		return methodName ? array[methodName]((item, index) => evaluated[index]) : evaluated;
	});
};

class CypressArrayUtil {

	/**
     * Initializes all functions that allow array iteration with cypress commands inside of the callback function
     */
	static init() {
		Array.prototype.mapCypress = function(callback) {
			return cypressArrayFunc(this, callback);
		};
		Array.prototype.filterCypress = function(callback) {
			return cypressArrayFunc(this, callback, "filter");
		};
		Array.prototype.findCypress = function(callback) {
			return cypressArrayFunc(this, callback, "find");
		};
		Array.prototype.findIndexCypress = function(callback) {
			return cypressArrayFunc(this, callback, "findIndex");
		};
		Array.prototype.someCypress = function(callback) {
			return cypressArrayFunc(this, callback, "some");
		};
		Array.prototype.everyCypress = function(callback) {
			return this.filterCypress(callback).then((res) => {
				return res.length === this.length;
			});
		};
	}

	/**
     * Gets the name of the global function that should be used to wrap a specific array iterator
     * @param {String} methodName - the name of the iterator method to wrap
     * @return {String} - the name of the function to wrap the iterator if valid, null otherwise
     */
	static getCypressFunction(methodName) {
		if (this.modifiableIterators.includes(methodName)) {
			return `${methodName}Cypress`;
		}
		return null;
	}
}

CypressArrayUtil.modifiableIterators = ["map", "filter", "find", "findIndex", "some", "every"];
module.exports = CypressArrayUtil;