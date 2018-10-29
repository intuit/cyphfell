describe("Tests the Cyphfell WrapReturns plugin", function() {

    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("Tests the WrapReturns plugin", () => {
        const promise = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve("success");
                }, 99);
            });
        };
        browser.call(promise).then((val) => {
            return cy.wrap(val);
        }).should((res) => {
            expect(res).to.be.equal("success");
        });
    });
});