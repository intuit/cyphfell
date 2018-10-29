describe("Tests the Cyphfell asynchronous array iterator functions", function() {

	beforeEach(() => {
		cy.visit("http://localhost:3000/");
	});

	it("Tests the Array map function", () => {
		cy.getAll("input").then((res) => {
			return res.mapCypress((item) => {
				return cy.wrap(item).getAttribute("id");
			});
		}).should((res) => {
			expect(res).to.deep.equal(["textInput", "checkboxInput", "fileInput", "firstRadio", "secondRadio", "submitForm"]);
		});

		[1, 3, 5].mapCypress((value) => value * 3).should((res) => {
			expect(res).to.deep.equal([3, 9, 15]);
		});
	});

	it("Tests the Array filter function", () => {
		cy.getAll("input").then((res) => {
			return res.filterCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => id.includes("Radio"));
			}).then((filtered) => {
				return filtered.mapCypress((item) => {
					return cy.wrap(item).getAttribute("id");
				});
			});
		}).should((res) => {
			expect(res).to.deep.equal(["firstRadio", "secondRadio"]);
		});

		[1, 3, 5].filterCypress((value) => value > 3).should((res) => {
			expect(res).to.deep.equal([5]);
		});
	});

	it("Tests the Array find function", () => {
		cy.getAll("input").then((res) => {
			return res.findCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput";
				});
			});
		}).then((res) => {
			cy.wrap(res).getAttribute("id").should((id) => {
				expect(id).to.be.equal("checkboxInput");
			});
		});

		cy.getAll("input").then((res) => {
			return res.findCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput222";
				});
			});
		}).should((res) => {
			expect(res).to.not.exist;
		});

		[1, 3, 5].findCypress((value) => value === 3).should((res) => {
			expect(res).to.be.equal(3);
		});
	});

	it("Tests the Array findIndex function", () => {
		cy.getAll("input").then((res) => {
			return res.findIndexCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput";
				});
			});
		}).should((res) => {
			expect(res).to.be.equal(1);
		});

		cy.getAll("input").then((res) => {
			return res.findIndexCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput2222";
				});
			});
		}).should((res) => {
			expect(res).to.be.equal(-1);
		});

		[1, 3, 5].findIndexCypress((value) => value === 5).should((res) => {
			expect(res).to.be.equal(2);
		});
	});

	it("Tests the Array some function", () => {
		cy.getAll("input").then((res) => {
			return res.someCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput";
				});
			});
		}).should((res) => {
			expect(res).to.be.true;
		});

		cy.getAll("input").then((res) => {
			return res.someCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((id) => {
					return id === "checkboxInput222";
				});
			});
		}).should((res) => {
			expect(res).to.be.false;
		});

		[1, 3, 5].someCypress((value) => value > 1).should((res) => {
			expect(res).to.be.equal(true);
		});

		[1, 3, 5].someCypress((value) => value > 10).should((res) => {
			expect(res).to.be.equal(false);
		});
	});

	it("Tests the Array every function", () => {
		cy.getAll("input").then((res) => {
			return res.everyCypress((item) => {
				return cy.wrap(item).isVisible();
			});
		}).should((res) => {
			expect(res).to.be.true;
		});

		cy.getAll("input").then((res) => {
			return res.everyCypress((item) => {
				return cy.wrap(item).getAttribute("id").then((getAtrb1) => getAtrb1 === "test");
			});
		}).should((res) => {
			expect(res).to.be.false;
		});
	});
});