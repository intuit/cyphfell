const fp = require("../../../src/util/FileParser");
const plugins = require("../../../src/util/PluginsUtil");
const esprima = require("../../../src/util/EsprimaUtils");

describe("Tests fixing errors", function() {

    let pluginsList = null;
    before(() => {
        global.options = {
            cypressFolder: "test/cypress/",
            baseNormalFolder: "test/",
            moduleResolvePaths: []
        };
        pluginsList = plugins.loadPlugins("./src/plugins/*");
    });

    it("Tests a parameter not being passed in correctly to functions", () => {
       const res = fp("export default class TestPage {\n" +
           "  static login(user, password) {\n" +
           "    if (config.log) {\n" +
           "        console.log(`Logging in as ${user}`);\n" +
           "    }\n" +
           "\n" +
           "    global.test.username = user;\n" +
           "    global.test.password = password;\n" +
           "\n" +
           "    // Exit ....\n" +
           "    browser.pause(5000);\n" +
           "\n" +
           "    this.userNameField().setValue(user);\n" +
           "    this.passwordField().waitForVisible();\n" +
           "    this.passwordField().setValue(password);\n" +
           "    this.loginButton().click();\n" +
           "  }\n" +
           "\n" +
           "  static userNameField() {\n" +
           "    return browser.element(\"#s\");\n" +
           "  }\n" +
           "\n" +
           "  static passwordField(sectionID=\"in\") {\n" +
           "    return browser.element(`#${sectionID} d`);\n" +
           "   }\n" +
           "\n" +
           "}\n", `${process.cwd()}/test/test.js`, global.options, pluginsList);
       expect(esprima.generateAST(res)).to.deep.equal(esprima.generateAST("export default class TestPage {\n" +
           "    static login(user, password) {\n" +
           "        if (config.log) {\n" +
           "            console.log(`Logging in as ${ user }`);\n" +
           "        }\n" +
           "        global.test.username = user;\n" +
           "        global.test.password = password;\n" +
           "        cy.wait(5000);\n" +
           "        this.userNameField().setValue(user);\n" +
           "        this.passwordField().waitForVisible();\n" +
           "        this.passwordField().setValue(password);\n" +
           "        this.loginButton().click();\n" +
           "    }\n" +
           "    static userNameField() {\n" +
           "        return cy.get(\"#s\");\n" +
           "    }\n" +
           "    static passwordField(sectionID = \"in\") {\n" +
           "        return cy.get(`#${ sectionID } d`);\n" +
           "    }\n" +
           "}"))
    });
});