const direct = () => {
	return cy.get("#textInput");
};

const indirect = () => {
	return cy.get("#textInput").then((res) => {
		return res;
	});
};

describe("Tests the Cyphfell wrap simplifcation concepts used", function() {

	beforeEach(() => {
		cy.visit("http://localhost:3000/");
		cy.get("#textInput").type("abc");
	});

	it("Tests wrap simplification concept with getText() with a direct element return", () => {
		direct().getText().then((value) => {
			expect(value).to.be.equal("abc");
		});
	});

	it("Tests wrap simplification concept with getText() with an indirect element return", () => {
		indirect().getText().then((value) => {
			expect(value).to.be.equal("abc");
		});
	});

	it("Tests non-wrap simplification result", () => {
		cy.get("#textInput").then((res) => {
			return cy.wrap(res).getText();
		}).then((res) => {
			expect(res).to.be.equal("abc");
		});
	});
});