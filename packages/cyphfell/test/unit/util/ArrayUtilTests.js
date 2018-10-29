const arrays = require("../../../src/CypressArrayUtil");

describe("Tests Cypress array util functions", function () {

    it("Tests getCypressFunction", () => {
        expect(arrays.getCypressFunction("NOT_AN_ARRAY_FUNCTION")).to.be.null;
        expect(arrays.getCypressFunction("find")).to.be.equal("findCypress");
        expect(arrays.getCypressFunction("map")).to.be.equal("mapCypress");
        expect(arrays.getCypressFunction("")).to.be.null;
    });
});