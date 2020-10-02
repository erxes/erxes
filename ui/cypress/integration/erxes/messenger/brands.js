import { SignIn, fakeName } from '../utils';

SignIn;

context('Check Deals', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Deals', () => {
    cy.signIn();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsIntegrationSettings')
      .find('a[href="/settings/brands"]')
      .click();

    const newBrandName = fakeName(10);

    cy.wait(5000);

    cy.get('button')
      .contains('Add New')
      .click();

    cy.get('div[class="modal-body"]')
      .get('input')
      .type(newBrandName);
    cy.get('div[class="modal-body"]')
      .get('button[type="submit"]')
      .click();
  });
});
