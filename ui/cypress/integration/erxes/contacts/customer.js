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

    cy.get("title").should("contain", "Conversation");

    cy.get('button[id="robot-get-started"]').click();

    cy.get('div[id="robot-features"]')
      .children()
      .should("have.length", 9);
    cy.get('button[id="robot-get-started"]').should("be.disabled");

    cy.get('div[id="robot-item-inbox"]').click();
    cy.get('div[id="robot-item-contacts"]').click();
    cy.get('div[id="robot-item-integrations"]').click();

    cy.get('button[id="robot-get-started"]').click();
    cy.get('div[id="robot-feature-close"]').click();

    // Contacts
    cy.get("#navigation")
      .children()
      .should("have.length", 7)
      .eq(3)
      .click();

    cy.get('a[href="/contacts/customer"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type("Erxes");

    let mail = Math.floor(Math.random() * 1000 + 1);

    cy.get('input[placeholder="Add Email"]').type(
      "erxes" + mail + "@gmail.com"
    );

    cy.get("#customerPrimaryEmailSave")
      .children()
      .should("have.length", 2)
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('div[class="popover-body"]')
      .children()
      .should("have.length", 1)
      .children()
      .should("have.length", 3)
      .children()
      .should("have.length", 3)
      .children()
      .should("have.length", 12)
      .eq(1)
      .click();

    cy.get('div[class="popover-body"]')
      .children()
      .should("have.length", 1)
      .children()
      .should("have.length", 3)
      .children()
      .should("have.length", 3)
      .children()
      .should("have.length", 12)
      .eq(2)
      .click();

    cy.get('button[icon="tag-alt"]').click();
    const tag = cy
      .get("section")
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click()
      .children()
      .eq(3)
      .children()
      .eq(1)
      .click();
  });
});
