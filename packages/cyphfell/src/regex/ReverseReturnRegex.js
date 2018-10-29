const arrays = require("../CypressArrayUtil");

module.exports = [
	".its(",
	".title()",
	".url()",
	".invoke(",
	"cy.getAll",
	".findAll("
].concat(arrays.modifiableIterators.map((it) => `${it}(`));