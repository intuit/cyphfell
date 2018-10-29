describe("Tests custom browser commands", function() {

	beforeEach(() => {
		cy.visit("http://localhost:3000/");
	});

	it("Tests getCssProperty", () => {
		cy.get("#textInput").getCssProperty("color").should((css) => {
			expect(css).to.be.equal("rgb(0, 0, 0)");
		});
	});

	it("Tests getElementSize", () => {
		cy.get("#textInput").getElementSize().should((size) => {
			expect(size).to.deep.equal({
				width: 127,
				height: 15
			});
		});

		cy.get("#textInput").getElementSize("width").should((size) => {
			expect(size).to.be.equal(127);
		});

		cy.get("#textInput").getElementSize("height").should((size) => {
			expect(size).to.be.equal(15);
		});

		cy.get("#textInput").getElementSize("clientWidth").should((size) => {
			expect(size).to.be.equal(127);
		});

		cy.get("#textInput").getElementSize("clientHeight").should((size) => {
			expect(size).to.be.equal(15);
		});
	});

	it("Tests getHTML", () => {
		// tests outerHTML
		cy.get("form").getHTML().should((html) => {
			expect(html).to.be.equal("<form><label>Name:<input id=\"textInput\" type=\"text\" name=\"name\"></label><div><label>Checkbox:<input id=\"checkboxInput\" type=\"checkbox\"></label></div><div><label>Select:<select><option data-test-attribute=\"frst\" value=\"test1\">First</option><option data-test-attribute=\"sec\" value=\"test2\">Second</option><option data-test-attribute=\"custom\" value=\"test3\">Third</option></select></label></div><div><label>File:<input id=\"fileInput\" type=\"file\"></label></div><div><label>Radio:<input id=\"firstRadio\" type=\"radio\"><input id=\"secondRadio\" type=\"radio\"></label></div><input id=\"submitForm\" type=\"submit\" value=\"Submit\"></form>",
				"outerHTML was not correct");
		});

		// tests innerHTML
		cy.get("form").getHTML(false).should((html) => {
			expect(html).to.be.equal("<label>Name:<input id=\"textInput\" type=\"text\" name=\"name\"></label><div><label>Checkbox:<input id=\"checkboxInput\" type=\"checkbox\"></label></div><div><label>Select:<select><option data-test-attribute=\"frst\" value=\"test1\">First</option><option data-test-attribute=\"sec\" value=\"test2\">Second</option><option data-test-attribute=\"custom\" value=\"test3\">Third</option></select></label></div><div><label>File:<input id=\"fileInput\" type=\"file\"></label></div><div><label>Radio:<input id=\"firstRadio\" type=\"radio\"><input id=\"secondRadio\" type=\"radio\"></label></div><input id=\"submitForm\" type=\"submit\" value=\"Submit\">",
				"innerHTML as not correct");
		});
	});

	it("Tests getLocation", () => {
		const testSelector = (selector, x, y) => {
			cy.get(selector).getLocation().should((loc) => {
				expect(loc).to.deep.equal({
					x: x,
					y: y
				});
			});

			cy.get(selector).getLocation("x").should((loc) => {
				expect(loc).to.be.equal(x);
			});

			cy.get(selector).getLocation("y").should((loc) => {
				expect(loc).to.be.equal(y);
			});
		};

		testSelector("#textInput", 458.0625, 0);
		testSelector("#fileInput", 396.109375, 58);
	});

	it("Tests getLocationInView", () => {
		const testSelector = (selector, x, y) => {
			cy.get(selector).getLocationInView().should((loc) => {
				expect(loc).to.deep.equal({
					x: x,
					y: y
				});
			});

			cy.get(selector).getLocationInView("x").should((loc) => {
				expect(loc).to.be.equal(x);
			});

			cy.get(selector).getLocationInView("y").should((loc) => {
				expect(loc).to.be.equal(y);
			});
		};

		testSelector("#textInput", 458, 0);
		testSelector("#fileInput", 396, 58);
	});

	it("Tests getNodeName", () => {
		cy.get("#textInput").getNodeName().should((name) => {
			expect(name).to.be.equal("input");
		});

		cy.get("form").getNodeName().should((name) => {
			expect(name).to.be.equal("form");
		});
	});

	it("Tests hasFocus", () => {
		cy.get("#textInput").hasFocus().should((focused) => {
			expect(focused).to.be.false;
		});

		cy.get("#textInput").focus();
		cy.get("#textInput").hasFocus().should((focused) => {
			expect(focused).to.be.true;
		});
	});

	it("Tests isEnabled", () => {
		cy.get("button").isEnabled().should((enabled) => {
			expect(enabled).to.be.true;
		});

		cy.get("form").submit();
		cy.get("button").isEnabled().should((enabled) => {
			expect(enabled).to.be.false;
		});
	});

	it("Tests isExisting", () => {
		cy.isExisting("#SubmittedText").should((exists) => {
			expect(exists).to.be.false;
		});

		cy.get("form").submit();
		cy.isExisting("#SubmittedText").should((exists) => {
			expect(exists).to.be.true;
		});
		cy.get("#SubmittedText").isExisting().should((exists) => {
			expect(exists).to.be.true;
		});
	});

	it("Tests isSelected", () => {
		const testSelection = (selector) => {
			cy.get(selector).isSelected().should((selected) => {
				expect(selected).to.be.false;
			});
			cy.get(selector).click();
			cy.get(selector).isSelected().should((selected) => {
				expect(selected).to.be.true;
			});
		};

		testSelection("#checkboxInput");
		testSelection("#firstRadio");

		cy.get("option[data-test-attribute=\"sec\"]").isSelected().should((selected) => {
			expect(selected).to.be.false;
		});
		cy.get("select").select("test2");
		cy.get("option[data-test-attribute=\"sec\"]").isSelected().should((selected) => {
			expect(selected).to.be.true;
		});
	});

	it("Tests isVisible", () => {
		cy.isVisible("#visibilityTestButton").should((visible) => {
			expect(visible).to.be.true;
		});
		cy.get("#visibilityTestButton").isVisible().should((visible) => {
			expect(visible).to.be.true;
		});

		cy.get("form").submit();

		cy.get("#visibilityTestButton").isVisible().should((visible) => {
			expect(visible).to.be.false;
		});
		cy.isVisible("#visibilityTestButton").should((visible) => {
			expect(visible).to.be.false;
		});

		cy.isVisible("#nonExistingElement").should((visible) => {
			expect(visible).to.be.false;
		});
	});

	it("Tests getText", () => {
		cy.get("#textInput").type("abc").getText().should((text) => {
			expect(text).to.be.equal("abc", "input text field was incorrect");
		});

		cy.get("button").getText().should((text) => {
			expect(text).to.be.equal("Test Button", "button text field was incorrect");
		});

		cy.get("textarea").type("abc").getText().should((text) => {
			expect(text).to.be.equal("abc", "textarea text field was incorrect");
		});

		cy.get("span").getText().should((text) => {
			expect(text).to.be.equal("TestSpan", "span text field was incorrect");
		});

		cy.get("#divText").getText().should((text) => {
			expect(text).to.be.equal("TestDivText", "div text field was incorrect");
		});
	});

	it("Tests waitForEnabled", () => {
		const start = new Date().getTime();
		cy.get("#enabledTestButton").waitForEnabled(25000, false).then(() => {
			expect(new Date().getTime() - start).to.be.gt(4900);
		});
		browser.waitForEnabled("#enabledTestButton", 25000, false).then(() => {
			expect(new Date().getTime() - start).to.be.gt(4900);
		});
		cy.get("#enabledTestButton").isEnabled().should((enabled) => {
			expect(enabled).to.be.true;
		});
	});

	it("Tests waitForExist", () => {
		cy.get("#textInput").waitForExist().then((res) => {
			expect(res).to.be.true;
		});
		browser.waitForExist("#textInput").then((res) => {
			expect(res).to.be.true;
		});
	});

	it("Tests overridden cy.get() command", () => {
		// expect no error to be thrown
		cy.get("#textInput");
		cy.get("input").getAttribute("id").then((id1) => {
			cy.getAll("input").spread((el1) => {
				expect(id1).to.be.equal(el1[0].id, "First element of cy.getAll() was not the result of cy.get()");
			});
			cy.get("//*[@id=\"textInput\"]").getAttribute("id").then((id2) => {
				expect(id1).to.be.equal(id2, "XPATH selector did not work");
			});
		});
	});

	it("Tests getAttribute", () => {
		cy.get("#textInput").getAttribute("id").should((id) => {
			expect(id).to.be.equal("textInput");
		});

		cy.getAttribute("#textInput", "id").should((id) => {
			expect(id).to.be.equal("textInput");
		});
	});

	it("Tests getAllWDIO()", () => {
		cy.getAll("input").should((res) => {
			cy.getAllWDIO("input").should((res2) => {
				expect(res).to.deep.equal(res2.value);
			});
		});
	});

	it("Tests findSubElements", () => {
		cy.get("form").findSubElements("input").should((res) => {
			expect(res.value.length).to.be.equal(6);
		});
	});

	it("Tests selectByAttribute", () => {
		cy.get("select").selectByAttribute("data-test-attribute", "custom").then(() => {
			return cy.get("option[data-test-attribute='custom']").isSelected();
		}).should((selected) => {
			expect(selected).to.be.true;
		});
	});

	it("Tests selectByIndex", () => {
		cy.get("select").selectByIndex(2).then(() => {
			return cy.get("option[data-test-attribute='custom']").isSelected();
		}).should((selected) => {
			expect(selected).to.be.true;
		});
	});

	it("Tests submitForm with a form", () => {
		cy.get("form").submitForm();
		cy.get("button").isEnabled().should((enabled) => {
			expect(enabled).to.be.false;
		});
	});

	it("Tests submitForm with a form descendant", () => {
		cy.get("input").submitForm();
		cy.get("button").isEnabled().should((enabled) => {
			expect(enabled).to.be.false;
		});
	});

	it("Tests addValue", () => {
		cy.get("#textInput").addValue("abc").addValue("bce").addValue("{{").addValue(5).getText().should((text) => {
			expect(text).to.be.equal("abcbce{{5");
		});
	});

	it("Tests chaining getTagName", () => {
		cy.get("#textInput").getTagName().should((tag) => {
			expect(tag).to.be.equal("input");
		});
	});
});