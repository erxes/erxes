import { fakeName } from '../utils';
import { SignIn } from '../utils';

SignIn;

context('Check Deals', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
  });

  it('Deals', () => {
    cy.signIn();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsIntegrationSettingsFather')
      .find('a[href="/settings/brands"]')
      .click();

    const createdBoardsCount = 0;
    const newBrandName = fakeName(10);

    cy.pause();

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
