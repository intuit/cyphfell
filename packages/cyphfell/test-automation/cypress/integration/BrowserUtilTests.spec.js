describe("Tests browser util functions", function() {

    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("Tests browser.call()", () => {
        const startDate = new Date().getTime();
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve("success")
            }, 3500);
        });
        browser.call(() => promise).should((res) => {
            expect(new Date().getTime() - startDate).to.be.greaterThan(3500);
            expect(res).to.be.equal("success");
        });

        const promise2 = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("failed")
            }, 3500);
        });
        browser.call(() => promise2).should((res) => {
            expect(new Date().getTime() - startDate).to.be.greaterThan(3500);
            expect(res).to.be.equal("failed");
        });
    });

    it("Tests browser.execute()", () => {
        browser.execute(() => {
            return window.location.origin;
        }).should((res) => {
            expect(res).to.be.equal("http://localhost:3000");
        });
    });

    it("Tests browser.addCommand()", () => {
        let called = false;
        browser.addCommand("commandName", () => {
            called = true;
        });
        browser.addCommand("command2", () => {
            return 35;
        });

        browser.commandName();
        expect(called).to.be.true;
        expect(browser.command2()).to.be.equal(35);
    });

    it("Tests browser.setCookie()", () => {
        browser.setCookie({name: "testCookieName", value: "testCookieValue"});
        cy.getCookie("testCookieName").should((cookie) => {
            expect(cookie.value).to.be.equal("testCookieValue");
        });
    });

    it("Tests browser.localStorage()", () => {
        browser.localStorage("POST", {
            key: "lsTest",
            value: 2525
        });
        browser.localStorage("GET", "lsTest").should((res) => {
            expect(res).to.deep.equal({
                key: "lsTest",
                value: "2525"
            });
        });
    });

    it("Tests browser.sessionStorage()", () => {
        browser.sessionStorage("POST", {
            key: "lsTest",
            value: 2525
        });
        browser.sessionStorage("GET", "lsTest").should((res) => {
            expect(res).to.deep.equal({
                key: "lsTest",
                value: "2525"
            });
        });
    });
});