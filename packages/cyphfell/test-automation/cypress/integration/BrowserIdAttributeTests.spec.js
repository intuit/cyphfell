describe("Tests browser elementId* functions", function() {

    beforeEach(() => {
        cy.visit("http://localhost:3000/");
    });

    it("Tests browser.elementIdAttribute() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdAttribute(el, "id").should((id) => {
                expect(id.value).to.be.equal("textInput");
            });
        });
    });

    it("Tests browser.elementIdCssProperty() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdCssProperty(el, "color").should((id) => {
                expect(id.value).to.be.equal("rgb(0, 0, 0)");
            });
        });
    });

    it("Tests browser.elementIdDisplayed() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdDisplayed(el).should((res) => {
                expect(res.value).to.be.true;
            });
        });
    });

    it("Tests browser.elementIdElement() function", () => {
        cy.get("form").then((el) => {
            browser.elementIdElement(el, "label").then((res) => {
                cy.get("label").should((el2) => {
                    expect(res.value[0]).to.be.equal(el2[0]);
                });
            });
        });
    });

    it("Tests browser.elementIdElements() function", () => {
        cy.get("form").then((el) => {
            browser.elementIdElements(el, "label").then((res) => {
                cy.getAll("label").should((elemList) => {
                    elemList.forEach((el2, i) => {
                        expect(el2[0]).to.be.equal(res.value[i]);
                    });
                });
            });
        });
    });

    it("Tests browser.elementIdEnabled() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdEnabled(el).should((res) => {
                expect(res.value).to.be.true;
            });
        });
    });

    it("Tests browser.elementIdLocation() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdLocation(el).then((res) => {
                cy.wrap(el).getLocation().should((loc) => {
                    expect(res.value).to.deep.equal(loc);
                });
            });
        });
    });

    it("Tests browser.elementIdLocationInView() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdLocationInView(el).then((res) => {
                cy.wrap(el).getLocationInView().should((loc) => {
                    expect(res.value).to.deep.equal(loc);
                });
            });
        });
    });

    it("Tests browser.elementIdName() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdName(el).should((res) => {
                expect(res.value).to.be.equal("input");
            });
        });
    });

    it("Tests browser.elementIdSelected() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdSelected(el).should((res) => {
                expect(res.value).to.be.false;
            });
        });
    });

    it("Tests browser.elementIdSize() function", () => {
        cy.get("#textInput").then((el) => {
            browser.elementIdSize(el).then((res) => {
                cy.get("#textInput").getElementSize().should((size) => {
                    expect(res.value).to.deep.equal(size);
                });
            });
        });
    });

    it("Tests browser.elementIdText() function", () => {
        cy.get("#textInput").type("abc").then((el) => {
            browser.elementIdText(el).then((res) => {
                cy.get("#textInput").getText().should((size) => {
                    expect(res.value).to.deep.equal(size);
                });
            });
        });
    });

    it("Tests browser.elementIdValue() function", () => {
        cy.get("#textInput").then((el) => {
            cy.wrap(el).type(["Escape", "Escape"].flat().join("")).getText().should((res) => {
                expect(res).to.be.equal("EscapeEscape");
            });
        });
    });
});