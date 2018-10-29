describe("Tests browser wait functions", function() {

    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("Tests browser.waitUntil() with a promise", () => {
        let finished = false;
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                finished = true;
                resolve(true);
            }, 3000);
        });
        browser.waitUntil(promise).then(() => {
            expect(finished).to.be.true;
        });
    });

    it("Tests browser.waitUntil() with a function", () => {
        let finished = false;
        let timesCalled = 0;
        let fn = () => {
            if (++timesCalled === 10) {
                finished = true;
                // test truthy value
                return 25;
            }
            return false;
        };
        browser.waitUntil(fn).then(() => {
            expect(finished).to.be.true;
            expect(timesCalled).to.be.equal(10);
        });
    });
});