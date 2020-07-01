import { fakeName } from "../utils";

const { eq, random, get } = require("lodash");

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
      .eq(3)
      .click();
    // random fakename
    const random = fakeName(8);

    // leads

    cy.get('a[href="/contacts/lead"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(2000);

    const random = fakeName(7);

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(2000);

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('i[class="icon icon-tag-alt"]')
      .eq(0)
      .click();
    cy.get('i[class="icon icon-tag-alt"]')
      .eq(1)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get("h3")
      .eq(1)
      .parent()
      .children()
      .eq(1)
      .click();
    cy.get('i[icon="tag-alt"]')
      .eq(0)
      .click();

    cy.wait(2000);

    cy.get('i[icon="tag-alt"]')
      .eq(1)
      .click();
    cy.wait(2000);

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get("#customers")
      .children()
      .eq(1)
      .children()
      .eq(0)
      .click();

    cy.get('i[icon="merge"]').click();

    cy.get('div[class="modal-body"]')
      .children()
      .children()
      .children()
      .eq(0)
      .children()
      .children()
      .eq(0)
      .click();

    cy.get('div[class="modal-body"]')
      .children()
      .children()
      .children()
      .eq(1)
      .children()
      .children()
      .eq(1)
      .click();

    cy.get('div[class="modal-body"]')
      .children()
      .children()
      .children()
      .eq(1)
      .children()
      .children()
      .eq(2)
      .click();

    cy.get('div[class="modal-body"]')
      .children()
      .children()
      .children()
      .eq(0)
      .children()
      .children()
      .eq(3)
      .click();

    cy.get('div[class="modal-body"]')
      .children()
      .children()
      .children()
      .eq(0)
      .children()
      .children()
      .eq(4)
      .click();

    cy.get('button[icon="checked-1"]').click();

    cy.wait(2000);

    cy.get('a[href="/contacts"]')
      .eq(1)
      .click();

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.wait(1000);
    cy.get('button[icon="times-circle"]').click();
    cy.wait(1000);
    cy.get('button[icon="checked-1"]').click();

    //customers

    const random = fakeName(9);
    cy.get('a[href="/contacts/customer"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(2000);

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('i[class="icon icon-tag-alt"]')
      .eq(0)
      .click();
    cy.get('i[class="icon icon-tag-alt"]')
      .eq(1)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get("h3")
      .eq(1)
      .parent()
      .children()
      .eq(0);

    cy.get('i[icon="tag-alt"]')
      .eq(0)
      .click();
    cy.wait(2000);

    cy.get('i[icon="tag-alt"]')
      .eq(1)
      .click();
    cy.wait(2000);

    //companies
    cy.get('a[href="/companies"]').click();
    cy.get('i[icon = "plus-circle"]').click();

    cy.get('i[icon="plus-circle"]')
      .eq(1)
      .click();

    cy.get('input[placeholder="Add Name"]').type(random);

    cy.get('i[icon="check-circle"]')
      .eq(0)
      .click();

    cy.get('i[icon="plus-circle"]')
      .eq(2)
      .click();

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get('i[icon="check-circle"]')
      .eq(0)
      .click();

    cy.get('i[icon="check-circle"]')
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(2000);

    cy.get("#companies")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get('i[class="icon icon-tag-alt"]')
      .eq(0)
      .click();
    cy.get('i[class="icon icon-tag-alt"]')
      .eq(1)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    cy.get("h3")
      .eq(1)
      .parent()
      .children()
      .eq(0);

    cy.get('i[icon="tag-alt"]')
      .eq(0)
      .click();

    cy.wait(2000);

    cy.get('i[icon="tag-alt"]')
      .eq(1)
      .click();
  });
});
