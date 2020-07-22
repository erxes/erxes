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

    cy.get("#navigation")
      .children()
      .eq(3)
      .click();

    const random = fakeName(6);

    cy.get('a[href="/contacts/lead"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(500);

    const random = fakeName(5);

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get('input[name="firstName"]').type(random);

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(500);

    const customer = cy.get("#customers").get("tr");

    customer.within(() => {
      cy.get("#customersCheckBox")
        .eq(0)
        .click();
    });

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

    cy.wait(500);

    cy.get('i[icon="tag-alt"]')
      .eq(1)
      .click();
    cy.wait(500);

    const customer = cy.get("#customers").get("tr");

    customer.within(() => {
      cy.get("#customersCheckBox")
        .eq(0)
        .click();

      cy.get("#customersCheckBox")
        .eq(1)
        .click();
    });

    cy.get('i[icon="merge"]').click();

    const mergeCustomerForm = cy.get('div[class="modal-body"]');

    mergeCustomerForm.within(() => {
      cy.get("li")
        .eq(0)
        .click();

      cy.get("li")
        .eq(1)
        .click();

      cy.get("li")
        .eq(7)
        .click();

      cy.get("li")
        .eq(8)
        .click();
      cy.get("li")
        .eq(9)
        .click();
    });

    cy.get('button[icon="checked-1"]').click();

    cy.wait(1000);

    cy.get('a[href="/contacts"]')
      .eq(1)
      .click();

    cy.get("#customersCheckBox").click();

    cy.get('button[icon="times-circle"]').click();

    cy.get('button[icon="checked-1"]').click();

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

    cy.get("#companiesCheckBox").click();

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

    cy.get("#companiesCheckBox").click();

    cy.get('button[icon="cancel-1"]').click();

    cy.get('button[icon="checked-1"]').click();

    cy.wait(1000);
  });
});
