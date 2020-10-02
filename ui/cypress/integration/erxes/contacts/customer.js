import { SignIn, fakeName } from '../utils';

SignIn;

context("Login", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Sign In", () => {
    cy.signIn();

    cy.get("#navigation")
      .children()
      .eq(3)
      .click();

    let random = fakeName(6);

    cy.get('a[href="/contacts/lead"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(3000);

    random = fakeName(5);

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[placeholder="Add Email"]').type(random + "@gmail.com");

    cy.get('input[name="firstName"]').type(random);

    cy.get("#customerPrimaryEmailSave")
      .children()
      .eq(1)
      .click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(3000);

    let customer = cy.get("#customers").get("tr");

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

    cy.wait(3000);

    customer = cy.get("#customers").get("tr");

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

    cy.wait(5000);

    cy.get('a[href="/contacts"]')
      .eq(1)
      .click();

    cy.wait(2000);

    cy.get("#customersCheckBox").click();

    cy.get('button[icon="times-circle"]').click();

    cy.wait(4000);

    cy.get('button[icon="check-circle"]').click();

    random = fakeName(9);

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

    cy.get('button[icon="check-circle"]').click();

    cy.wait(1000);
  });
});
