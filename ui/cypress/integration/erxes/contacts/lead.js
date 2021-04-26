import { SignIn, fakeName, waitElm, waitTilDisappear, waitAndClick } from '../utils';

SignIn;

context("Contacts", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Lead", () => {
    cy.signIn();

    cy.get("#navigation")
      .children()
      .eq(3)
      .click();

    const random = fakeName(6);

    cy.get('a[href="/contacts/lead"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('div .Select-placeholder').contains('Enter an email').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('button[type="submit"]').eq(0).click();
    // for save button disappear which mean popup close
    waitTilDisappear('button[type="submit"]');

    cy.get("#customers>.crow").eq(2).get("#customersCheckBox").click();

    cy.get('button[icon="tag-alt"]').click();

    waitElm('i[class="icon icon-tag-alt"]');

    cy.get('i[class="icon icon-tag-alt"]').eq(0).click();

    cy.get('button[icon="tag-alt"]').click();

    waitTilDisappear('button[icon="tag-alt"]');

    cy.get("#customers>.crow").eq(3).within(() => {
      cy.get("#customersCheckBox").click();
    })

    cy.get("#customers>.crow").eq(4).within(() => {
      cy.get("#customersCheckBox").click();
    })

    waitElm('i[icon="merge"]');
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

    cy.get('button[icon="check-circle"]').click();
    waitTilDisappear('button[icon="check-circle"]');

    cy.get('a[href="/contacts"]').click();

    cy.get("#customersCheckBox").click();

    cy.get('button[icon="times-circle"]').click();

    cy.get('button[icon="check-circle"]').click();
  });
});
