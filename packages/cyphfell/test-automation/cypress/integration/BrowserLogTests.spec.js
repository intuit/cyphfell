describe("Tests the browser log function", function() {

	const test = () => {
		browser.log().then((logs) => {
			const testInclusion = (level, message) => {
				expect(logs.value).to.deep.include({
					level: level,
					message: message
				});
			};

			testInclusion("INFO", "%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools");
			testInclusion("ERROR", "constructor error");
			expect(logs.value.length).to.be.equal(2);
		});
	};

	beforeEach(() => {
		cy.visit("http://localhost:3000/");
	});

	it("Tests browser.log() without reloading the page", () => {
		console.error("random log to make sure this console does not get spied on");
		test();
	});

	it("Tests browser.log() with a page reload", () => {
		test();
		cy.reload();
		test();
	});
});