import { SignIn, fakeName, waitTilDisappear, waitAndClick } from '../utils';

SignIn;

context("Contacts", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Company", () => {
    cy.signIn();

    cy.get("#navigation")
      .children()
      .eq(3)
      .click();

    const random = fakeName(6);

    cy.get('a[href="/companies"]').click();
    cy.get('i[icon = "plus-circle"]').click();

    cy.get('div .Select-placeholder').contains('Enter company name').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('div .Select-placeholder').contains('Enter company email').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('button[type="submit"]').eq(0).click();
    waitTilDisappear('button[type="submit"]');

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

    cy.get("#companiesCheckBox").click();

    cy.get('button[icon="cancel-1"]').click();

    cy.get('button[icon="check-circle"]').click();
  });
});
