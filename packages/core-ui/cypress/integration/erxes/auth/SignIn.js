import { SignIn } from '../utils';

SignIn;

context('Login', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
  });

  it('Sign In', () => {
    cy.signIn();
  });
});
