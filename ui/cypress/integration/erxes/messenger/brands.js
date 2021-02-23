import { SignIn, fakeName, waitElm } from '../utils';

SignIn;

context('Check brands', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Brands', () => {
    cy.signIn();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsIntegrationSettings')
      .find('a[href="/settings/brands"]')
      .click();

    const newBrandName = fakeName(10);

    waitElm('#BrandSidebar li');

    cy.get('button')
      .contains('Add New')
      .click();

    cy.get('div[class="modal-body"]')
      .get('input').eq(0)
      .type(newBrandName);

    cy.get('button[type="submit"]').click();
  });
});
