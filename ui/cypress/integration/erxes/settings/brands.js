import 'cypress-file-upload';
import { SignIn, fakeName, waitElm } from "../utils";

SignIn;

context('Brands', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Brands', () => {
    cy.signIn();

    // Brand
    cy.get('#Settings').click();
    cy.get('#SettingsGeneralSettings').children().eq(1).click();
    cy.url().should('include', '/settings/brands');

    waitElm('#BrandSidebar li');

    cy.get('#NewBrandButton').click();
    cy.get('input').eq(0).type(fakeName(7));
    cy.get('textarea').type('something');
    cy.get('button[icon=check-circle]').click();

    cy.get('#BrandSidebar').children().eq(0).click();

    cy.get('#ManageIntegration').click()
    cy.get('input').type('nani').clear()

    cy.get('.modal-body').within(() => {
        cy.get('ul').children().eq(0).click()
    })

    cy.get('form').get('button[type="submit"]').click()

    cy.get('button[icon="check-circle"]').click()
  });
});