import { SignIn, fakeName, waitElm, waitTilDisappear, waitAndClick } from '../utils';

SignIn;

context("Contacts", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Customer and Company", () => {
    cy.signIn();

    cy.get("#navigation")
      .children()
      .eq(3)
      .click();

    let random = fakeName(6);

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

    random = fakeName(9);

    cy.get('a[href="/contacts/customer"]').click();

    waitElm('button[icon="plus-circle"]');
    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('div .Select-placeholder').contains('Enter an email').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('button[icon="check-circle"]').click();

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

    cy.get('a[href="/companies"]').click();
    cy.get('i[icon = "plus-circle"]').click();

    cy.get('div .Select-placeholder').contains('Enter company name').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('div .Select-placeholder').contains('Enter company email').click().type(random + "@nmma.co");
    waitAndClick('div .Select-menu-outer');

    cy.get('button[icon="check-circle"]').click();

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
