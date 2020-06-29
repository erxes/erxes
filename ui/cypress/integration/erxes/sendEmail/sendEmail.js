context('Send Email Verification', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
  });

  it('Sign In', () => {
    const email = Cypress.env('userEmail');
    const password = Cypress.env('userPassword');

    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.url().should('include', '/inbox');
    cy.getCookie('auth-token').should('exist');
    cy.get('#Settings').click();
    cy.url().should('include', '/settings');

    // General Settings Main
    cy.get('#SettingsGeneralSettingsFather').children().should('have.length',9);
    cy.get('#SettingsGeneralSettingsFather').children().eq(5).click();
    cy.url().should('include', '/segments/customer');

    // Segments
    cy.get('#SegmentSidebar').children().eq(0).click()
    cy.url().should('include','/segments/customer')

    //New segment create
    cy.get('#NewSegmentButton').click();
    cy.get('input[name=name]').type('a1')
    cy.get('input[name=description]').type('testinga1')
    cy.get('select[name=subOf]').select('s1')
    cy.get('.sc-fZwumE').click();
    cy.get('div > input').clear().type(`#000000`)
    cy.get('.sc-fZwumE').click();
    cy.get('button[icon=subject]').click()
    cy.get('button[icon=subject]').click()
    cy.get('button[icon=subject]').click()
    cy.get('button[icon=subject]').click()
    cy.get('button[icon=subject]').click()
    cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(State)').click()
    cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Visitor)').click();
    cy.get('button[icon=times]').click()
    cy.get('button[icon=computer-mouse]').click()



  });
});
