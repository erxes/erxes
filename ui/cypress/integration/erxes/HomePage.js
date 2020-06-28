context('Cypress.platform', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);

    cy.visit('/');

    let token;

    cy.getCookie('auth-token').then((c) => {
      // save cookie until we need it
      token = c;
    });

    if (!token) {
      const email = 'admin@erxes.io';
      const password = 'Genesis1o1';

      cy.get('input[name=email]').type(email);
      cy.get('input[name=password]').type(`${password}{enter}`);
    }

    cy.pause();

    cy.url().should('include', '/inbox');
    cy.getCookie('auth-token').should('exist');

    // Get current user
  });

  it('Get current user', () => {
    const query = `
      query currentUser {
        currentUser {
          _id,
          email,
          username,
          details {
            avatar
            fullName
            shortName
            position
            location
            description
          }
        }
      }
    `;

    cy.request({
      url: 'http://localhost:3300/graphql',
      method: 'POST',
      body: {
        query,
        variables: {}
      }
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.property('data');

      console.log(resp.body);
    });
  });
});