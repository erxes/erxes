import 'cypress-file-upload';
import { SignIn, fakeName } from "../utils";

SignIn;

context('Tags', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Tags', () => {
    cy.signIn();

    cy.get('#Settings').click();
    cy.get('#SettingsGeneralSettings').children().eq(4).click();
    cy.url().should('include', '/tags/conversation');

    for(let i=0; i<=4; i++){
      cy.get("#TagsSidebar").children().eq(i).click()

      cy.get('#AddTagButton').click()
      cy.get('input[name=name]').type('last3' + i + fakeName(1))
      cy.get('label').contains('Color').parent().children().eq(1).click();
      cy.get('[style="position: relative;"] > input').clear().type('#000000')
      cy.get('label').contains('Color').parent().children().eq(1).click();
      cy.get('#AddTagButtons').children().eq(1).click()
    }
  });
});
