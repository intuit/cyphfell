describe("Tests browser event functions", function() {

	beforeEach(() => {
		cy.visit("http://localhost:3000/");
	});

	it("Tests browser.on()", () => {
		let clickCount = 0;
		browser.on("click", (event) => {
			++clickCount;
			expect(event.type).to.be.equal("click");
		});

		let secondClicks = 0;
		browser.on("click", (event) => {
			++secondClicks;
			expect(event.type).to.be.equal("click");
		});

		let calledKeydown = false;
		browser.on("keydown", (event) => {
			calledKeydown = true;
			expect(event.type).to.be.equal("keydown");
		});

		cy.get("#textInput").click().should(() => {
			expect(clickCount).to.be.equal(1);
			expect(secondClicks).to.be.equal(1);
		});

		cy.get("#textInput").click().should(() => {
			expect(clickCount).to.be.equal(2);
			expect(secondClicks).to.be.equal(2);
		});

		cy.get("#textInput").type("a").should(() => {
			expect(calledKeydown).to.be.true;
		});
	});

	it("Tests browser.once()", () => {
		let callCount = 0;
		browser.once("click", (event) => {
			++callCount;
			expect(event.type).to.be.equal("click");
		});

		cy.get("#textInput").click().should(() => {
			expect(callCount).to.be.equal(1);
		});

		cy.get("#textInput").click().should(() => {
			expect(callCount).to.be.equal(1);
		});
	});

	it("Tests browser.removeListener() with on()", () => {
		let clicks = 0;
		const clickListener = () => {
			++clicks;
		};

		let secondClicks = 0;
		const clickListener2 = () => {
			++secondClicks;
		};

		let keydowns = 0;
		const keydownsListener = () => {
			++keydowns;
		};
		browser.on("click", clickListener);
		browser.on("click", clickListener2);
		browser.on("keydown", keydownsListener);
		browser.on("keydown", clickListener);
		browser.removeListener("click", clickListener);

		// verify the second click listener still works, but the first one doesn't
		cy.get("#textInput").click().then(() => {
			expect(clicks).to.be.equal(0);
			expect(secondClicks).to.be.equal(1);
		});

		// verify that listeners of other events still work
		cy.get("#textInput").type("abc").then(() => {
			expect(keydowns).to.be.equal(3);
			expect(clicks).to.be.equal(3);
		});
	});

	it("Tests browser.removeListener() with once()", () => {
		let clicks = 0;
		const clickListener = () => {
			++clicks;
		};

		let secondClicks = 0;
		const clickListener2 = () => {
			++secondClicks;
		};

		let keydowns = 0;
		const keydownsListener = () => {
			++keydowns;
		};
		browser.once("click", clickListener);
		browser.once("click", clickListener2);
		browser.once("keydown", keydownsListener);
		browser.once("keydown", clickListener);
		browser.removeListener("click", clickListener);

		// verify the second click listener still works, but the first one doesn't
		cy.get("#textInput").click().then(() => {
			expect(clicks).to.be.equal(0);
			expect(secondClicks).to.be.equal(1);
		});

		// verify that listeners of other events still work
		cy.get("#textInput").type("abc").then(() => {
			expect(keydowns).to.be.equal(1);
			expect(clicks).to.be.equal(1);
		});
	});

	it("Tests browser.removeAllListeners()", () => {
		let clicks = 0;
		const clickListener = () => {
			++clicks;
		};

		let secondClicks = 0;
		const clickListener2 = () => {
			++secondClicks;
		};

		let keydowns = 0;
		const keydownsListener = () => {
			++keydowns;
		};
		browser.on("click", clickListener);
		browser.on("click", clickListener2);
		browser.on("keydown", keydownsListener);
		browser.on("keydown", clickListener);
		browser.removeAllListeners("click");

		cy.get("#textInput").click().then(() => {
			expect(clicks).to.be.equal(0);
			expect(secondClicks).to.be.equal(0);
		});

		// verify that listeners of other events still work
		cy.get("#textInput").type("abc").then(() => {
			expect(keydowns).to.be.equal(3);
			expect(clicks).to.be.equal(3);
		});
	});
});