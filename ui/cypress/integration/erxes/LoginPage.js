context('Login', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);

    cy.visit('/');

    cy.clearCookies();
  });

  it('cy.getCookie() - get a browser cookie', () => {
    const email = 'ganzorig.b@nmma.co';
    const password = 'password';

    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.pause();

    cy.url().should('include', '/inbox');
    cy.getCookie('auth-token').should('exist');

    cy.get('title').should('contain', 'Conversation');
  });
});
