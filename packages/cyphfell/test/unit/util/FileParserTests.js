const rewire = require("rewire");
const fileParser = rewire("../../../src/util/FileParser");
const esprima = require("../../../src/util/EsprimaUtils");
const sinon = require("sinon");
const handlers = require("../../../src/handlers/FileHanderList");
const report = require("../../../src/reports/ReportGenerator");

describe("Tests separateVariableDeclarations method", function () {

    let fn = null;
    before(() => {
        fn = fileParser.__get__("separateVariableDeclarations");
    });

    it("Tests with no variables", () => {
        expect(
            fn(`class X { method() { return true; } }`)
        ).to.be.equal(
            `class X { method() { return true; } }`
        );
    });

    it("Tests with one variable declaration", () => {
        expect(
            fn(`const x = 25;`)
        ).to.be.equal(
            `const x = 25;`
        );
    });

    it("Tests with two variable declarations", () => {
        expect(
            esprima.generateAST(fn(`const x = 25, y = 25;`))
        ).to.deep.equal(
            esprima.generateAST(`const x = 25; const y = 25;`)
        );
    });

    it("Tests with one variable declaration init, rest null", () => {
        expect(
            esprima.generateAST(fn(`let x = 25, y;`))
        ).to.deep.equal(
            esprima.generateAST(`let x = 25; let y;`)
        );
    });

    it("Tests with two variable declaration no init", () => {
        expect(
            esprima.generateAST(fn(`let x, y;`))
        ).to.deep.equal(
            esprima.generateAST(`let x; let y;`)
        );
    });

    it("Tests with five variable declarations", () => {
        expect(
            esprima.generateAST(fn(`var x, y, z = 3, w = global.someProperty.someCall(), e = true;`))
        ).to.deep.equal(
            esprima.generateAST(`var x; var y; var z = 3; var w = global.someProperty.someCall(); var e = true;`)
        );
    });
});

describe("Test FileParser export function", function () {

    let sandbox = null;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        global.logger = {
            log: () => {

            }
        };
    });

    it("Tests to make sure only one handler gets invoked", () => {
        handlers.forEach((handler) => {
            sandbox.stub(handler, "parseImpl").returns("test return value");
        });
        fileParser(`const x = 25;`, `${process.cwd()}/nonExistantFile.js`, {}, []);
        expect(handlers.filter((handler) => handler.parseImpl.callCount === 1).length).to.be.equal(1, "Multiple handlers were invoked for the same file");
        expect(handlers.filter((handler) => handler.parseImpl.callCount > 1).length).to.be.equal(0, "A handler was called multiple times");
    });

    it("Tests to make sure no handler gets invoke if none are valid", () => {
        handlers.forEach((handler) => {
            sandbox.stub(handler, "parseImpl").returns("test return value");
        });
        sandbox.stub(console, "error");
        sandbox.stub(report, "onCriticalError");
        const res = fileParser(`const x = 25;`, `${process.cwd()}/nonExistantFile.nohandlerextension`, {}, []);
        expect(handlers.filter((handler) => handler.parseImpl.callCount > 0).length).to.be.equal(0, "A handler was invoked");
        expect(res).to.be.equal("const x = 25;");
    });

    afterEach(() => {
        sandbox.restore();
    });
});