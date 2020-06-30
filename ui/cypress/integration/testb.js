const { eq } = require("lodash");

context("Login", () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit("/");
    cy.clearCookies();
  });

  it("Sign In", () => {
    const email = Cypress.env("userEmail");
    const password = Cypress.env("userPassword");

    cy.get("input[name=email]").type(email);
    cy.get("input[name=password]").type(`${password}{enter}`);

    cy.url().should("include", "/inbox");
    cy.getCookie("auth-token").should("exist");

    // robot get started

    cy.get('button[id="robot-get-started"]').click();

    cy.get('b[id = "first-feature"]').click();
    cy.get('b[id = "second-feature"]').click();

    cy.get('button[id="robot-get-started"]').click();
    cy.get("#times").click();

    // click settings
    cy.get("#settings").click();

    // click permission

    cy.get("#general-settings-father")
      .children()
      .should("have.length", 9)
      .eq(2)
      .click();

    // choose dropdowns in permission
    cy.get("#permission-choose-module").click();

    cy.get("#react-select-2--option-0").click();

    cy.get("#permission-choose-action").click();
    cy.get("#react-select-3--option-0").click();

    cy.get("#permission-choose-users").click();
    cy.get("#react-select-4--option-0").click();

    //new permission

    cy.get("#permission-new-permission").click();

    // what action can do

    cy.get(":nth-child(1) > .sc-fgrSAo > :nth-child(1)").click();
    cy.get("#react-select-5--option-0").click();

    cy.get("#react-select-6--value > .Select-placeholder").click();
    cy.get("#react-select-6--option-0").click();

    // who can
    cy.get("#react-select-7--value > .Select-placeholder").click();
    cy.get("#react-select-7--option-0").click();

    cy.get(".Select-placeholder").click();
    cy.get(".sc-hzNEM").click();

    cy.get(".sc-kPVwWT > .sc-iQKALj > span").click();
    cy.get(".PFIuR").click();

    // create user group
    cy.get("#permission-create-user-group").click();

    cy.get("#react-select-6--value > .Select-placeholder").click();

    // Filter by segments settings
    cy.get("#contacts-segments-settings").click();
    // New segment
    cy.get("#new-segment").click();
    cy.get("input[name=name]").type("hello");

    cy.get("[name=subOf]").select("Not selected");

    cy.get("input[name=description]").type("Hello World");

    cy.get("#segment-color").click();

    cy.get("#segment-color").click();

    //add properties
    cy.get("#segment-add-properties").click();

    cy.get("#react-select-2--value").click();

    cy.get(":nth-child(1) > #react-select-2--option-0").click();
    cy.get("#segment-select-operator").select("equals");

    cy.get("#react-select-3--value").click();

    cy.get("#react-select-3--option-1").click();

    //add events
    cy.get("#segment-add-events").click();

    //cy.get("#add-events-select-event").click();
    //show count
    cy.get("#segment-show-count").click();

    //save button
    cy.get("#button-group")
      .children()
      .should("have.length", 1)
      .eq(0)
      .children()
      .should("have.length", 3)
      .eq(2)
      .click();

    //cancel button
    cy.get("#button-group")
      .children()
      .should("have.length", 1)
      .eq(0)
      .children()
      .should("have.length", 3)
      .eq(0)
      .click();

    // back to contacts

    cy.get("#navigation")
      .children()
      .should("have.length", 7)
      .eq(3)
      .click();

    cy.get("#customers")
      .children()
      .should("have.length", 1)
      .children()
      .should("have.length", 9)
      .eq(0)
      .click();

    //cy.get('[type="checkbox"]').check();

    //  cy.get('button[icon="tag-alt"]').click();

    const tag = cy
      .get("section")
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    tag.click();
    tag.within(() => {});
  });
});
