const hookQueue = [];
const addToQueue = (name, details = {}) => {
	hookQueue.push({
		details: details,
		name: name
	});
};

const commandLog = [];

const config = {
	before: () => {
		addToQueue("before");
	},
	beforeSuite: (suite) => {
		addToQueue("beforeSuite", suite);
	},
	beforeTest: (test) => {
		addToQueue("beforeTest", test);
	},
	afterTest: (test) => {
		addToQueue("afterTest", test);
	},
	afterSuite: (suite) => {
		addToQueue("afterSuite", suite);
	},
	after: () => {
		addToQueue("after");
		try {
			expect(hookQueue[0].name).to.be.equal("before");
			expect(hookQueue[1].name).to.be.equal("beforeSuite");
			expect(hookQueue[1].details.title).to.be.equal("Tests the data capture hooks defined in a config");
			expect(hookQueue[2].name).to.be.equal("beforeTest");
			expect(hookQueue[2].details.title).to.be.equal("Random test 1");
			expect(hookQueue[3].name).to.be.equal("afterTest");
			expect(hookQueue[3].details.title).to.be.equal("Random test 1");
			expect(hookQueue[4].name).to.be.equal("beforeTest");
			expect(hookQueue[4].details.title).to.be.equal("Random test 2");
			expect(hookQueue[5].name).to.be.equal("afterTest");
			expect(hookQueue[5].details.title).to.be.equal("Random test 2");
			expect(hookQueue[6].name).to.be.equal("afterSuite");
			expect(hookQueue[6].details.title).to.be.equal("Tests the data capture hooks defined in a config");

			expect(hookQueue[7].name).to.be.equal("beforeSuite");
			expect(hookQueue[7].details.title).to.be.equal("Tests another test suite");
			expect(hookQueue[8].name).to.be.equal("beforeTest");
			expect(hookQueue[8].details.title).to.be.equal("XYZ");
			expect(hookQueue[9].name).to.be.equal("afterTest");
			expect(hookQueue[9].details.title).to.be.equal("XYZ");
			expect(hookQueue[10].name).to.be.equal("afterSuite");
			expect(hookQueue[10].details.title).to.be.equal("Tests another test suite");

			expect(hookQueue[11].name).to.be.equal("after");
			expect(hookQueue.length).to.be.equal(12);

			// comparing commandLog directly doesn't seem to work, so JSON.parse(JSON.stringify(commandLog)) is used instead
			expect(JSON.parse(JSON.stringify(commandLog))).to.deep.equal([
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "before"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "after"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "before"
				},
				{
					name: "visit",
					args: [
						"http://localhost:3000/"
					],
					type: "after"
				}
			]);
			expect(commandLog.length).to.be.equal(4);
		} catch (ex) {
			cy.writeFile("test-automation/automationErrors.log", ex.stack);
			throw new Error(ex);
		}
	},
	beforeCommand: (name, args) => {
		commandLog.push({name: name, args: args, type: "before"});
	},
	afterCommand: (name, args) => {
		commandLog.push({name: name, args: args, type: "after"});
	}
};
initBrowser.initConfig(browser, config);