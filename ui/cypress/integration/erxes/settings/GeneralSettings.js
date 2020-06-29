context('Settings', () => {
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
    cy.get('#SegmentSidebar').children().eq(0).click()
    cy.url().should('include','/segments/customer')
    cy.get('#NewSegmentButton').click()
    //General System config
    //General Settings
    //cy.get('#SettingsSidebar').children().should('have.length',3);
    //cy.get('#SettingsSidebar').children().eq(0).click();
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8);
    // cy.get('#GeneralSettingsMenuFather').children().eq(0).click()
    // cy.get('div.Select-value:first').click().get('.Select-option:contains(Italian)').click();
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Afghan)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Bag)').click()
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(0).children().should('have.length',2).eq(0).click()

    // // //File upload
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8).eq(1).click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Icon)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Tagged Image File Format)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Amazon)').click()
    // cy.get('#react-select-8--value > .Select-value').click().get('.Select-option:contains(Private)').click();
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(1).children().should('have.length',2).eq(0).click()

    // // //Google Cloud Storage
    // const blah = cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(2).click();
    // blah.find('input').type('amra');
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(2).children().should('have.length',2).eq(0).click()

    //AWS S3
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8);
    // const awss3 =  cy.get('#GeneralSettingsMenuFather').children().eq(3).click();
    // awss3.within(() => {
    //   for( let i=0; i<=5; i++){
    //     cy.get('input').eq(i).type('ssss' + i)
    //   }
    // })
    // cy.get('#GeneralSettingsMenuFather').children().eq(3).children().eq(0).click();

    //Integrations config
    //cy.get('#SettingsSidebar').children().should('have.length',3).eq(1).click()
    // Engage config
    //cy.get('#SettingsSidebar').children().should('have.length',3).eq(2).click()



    //cy.get('title').should('contain', 'Conversation');
    //
    // cy.get('button[id="robot-get-started"]').click()
    //
    // cy.get('div[id="robot-features"]').children().should('have.length', 9)
    // cy.get('button[id="robot-get-started"]').should('be.disabled')
    //
    //
    // cy.get('div[id="robot-item-inbox"]').click();
    // cy.get('div[id="robot-item-contacts"]').click();
    // cy.get('div[id="robot-item-integrations"]').click();
    //
    //
    // cy.get('button[id="robot-get-started"]').click();
    // cy.get('div[id="robot-feature-close"]').click();
  });
});
