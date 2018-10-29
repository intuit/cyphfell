describe("Tests browser util functions", function() {

    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("Tests browser.getAttribute()", () => {
        browser.getAttribute("#textInput", "id").should((id) => {
            expect(id).to.be.equal("textInput");
        });
    });

    it("Tests browser.setValue()", () => {
        browser.setValue("#textInput", "abcdefghijk");
        cy.get("#textInput").invoke("val").should((val) => {
            expect(val).to.be.equal("abcdefghijk");
        });

        browser.setValue("#textInput", "df");
        cy.get("#textInput").invoke("val").should((val) => {
            expect(val).to.be.equal("df");
        });
    });

    // TODO: uncomment after adding support for this command
    /*it("Tests browser.windowHandleSize()", () => {
        const res = browser.windowHandleSize();
        expect(res).to.deep.equal({
            width: 1000,
            height: 660
        });

        browser.windowHandleSize({width: 800, height: 600});
        const res2 = browser.windowHandleSize();
        expect(res2).to.deep.equal({
            width: 800,
            height: 600
        });

        browser.windowHandleSize({width: 1000, height: 660});
    });*/
});