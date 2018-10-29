const rewire = require("rewire");
const plugins = rewire("../../../src/util/PluginsUtil");
const sinon = require("sinon");
const wdio = require("../../../src/constants/FrameworkConstants");
const _ = require("lodash");

describe("Tests PluginsUtil functions", function () {

	const plugin1 = {
		getName: () => "TestName1",
        getSupportedFrameworks: () => [wdio.WebdriverIO]
	};
	const plugin2 = {
		getName: () => "SecondPluginTest",
		getSupportedFrameworks: () => [wdio.WebdriverIO]
	};
	const extra1 = {
		getName: () => "ExtraPlugin1",
		getSupportedFrameworks: () => [wdio.WebdriverIO]
	};
	let sandbox = null;

	beforeEach(() => {
		sandbox = sinon.createSandbox();
		sandbox.stub(plugins, "loadPlugins").returns([plugin1, plugin2]);
	});

	it("Tests plugin disabling", () => {
		expect(plugins.getActivatedPlugins([], [plugin1.getName()])).to.deep.equal([plugin2]);
		expect(plugins.getActivatedPlugins([], [plugin1.getName(), plugin2.getName()])).to.deep.equal([]);
		expect(plugins.getActivatedPlugins([], [plugin2.getName()])).to.deep.equal([plugin1]);

		expect(plugins.getActivatedPlugins([], ["NOT A PLUGIN NAME"])).to.deep.equal([plugin1, plugin2]);
		expect(plugins.getActivatedPlugins([], [plugin1.getName(), "NOT A PLUGIN NAME"])).to.deep.equal([plugin2]);
		expect(plugins.getActivatedPlugins([extra1], [plugin1.getName(), extra1.getName()])).to.deep.equal([plugin2, extra1], "Extra plugins should not be disabled");
	});

	it("Tests with no disabled plugin", () => {
		expect(plugins.getActivatedPlugins([], [])).to.deep.equal([plugin1, plugin2]);
	});

	it("Tests with extra plugins", () => {
		const loaded = plugins.getActivatedPlugins([extra1], []);
		expect(loaded.length).to.be.equal(3);
		expect(loaded.includes(extra1)).to.be.true;
		expect(loaded.includes(plugin1)).to.be.true;
		expect(loaded.includes(plugin2)).to.be.true;
	});

	it("Tests to make sure plugins that don't support the current framework are not loaded", () => {
		const extra2 = _.cloneDeep(extra1);
		extra2.getSupportedFrameworks = () => ["none"];
		plugins.loadPlugins.returns([]);
		const loaded = plugins.getActivatedPlugins([extra2], []);
		expect(loaded.length).to.be.equal(0);
	});

	afterEach(() => {
		sandbox.restore();
	});

});