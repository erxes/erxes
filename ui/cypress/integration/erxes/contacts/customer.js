import {
  SignIn,
  fakeName,
  waitElm,
  waitTilDisappear,
  waitAndClick,
} from "../utils";

SignIn;

context("Contacts", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Customer", () => {
    cy.signIn();

    cy.visit("/contacts/customer");

    waitElm('button[icon="plus-circle"]');
    cy.get('button[icon="plus-circle"]').click();

    const random = fakeName(6);

    cy.get('input[name="firstName"]').type(random);

    cy.get("div .Select-placeholder")
      .contains("Enter an email")
      .click()
      .type(random + "@nmma.co");
    waitAndClick("div .Select-menu-outer");

    cy.get('button[type="submit"]')
      .eq(0)
      .click();
    waitTilDisappear('button[type="submit"]');

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
  });
});
