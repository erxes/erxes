export const fakeName = (length) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const SignIn = Cypress.Commands.add('signIn', () => {
  const email = Cypress.env('userEmail');
  const password = Cypress.env('userPassword');

  cy.get('input[name=email]').type(email);
  cy.get('input[name=password]').type(`${password}{enter}`);

  cy.url().should('include', '/inbox');
  cy.getCookie('auth-token').should('exist');

  cy.get('title').should('contain', 'Conversation');

  cy.get('button[id="robot-get-started"]').click();

  cy.get('div[id="robot-features"]')
    .children()
    .should('have.length', 9);
  cy.get('button[id="robot-get-started"]').should('be.disabled');

  cy.get('div[id="robot-item-inbox"]').click();
  cy.get('div[id="robot-item-contacts"]').click();
  cy.get('div[id="robot-item-integrations"]').click();

  cy.get('button[id="robot-get-started"]').click();
  cy.get('div[id="robot-feature-close"]').click();
});
