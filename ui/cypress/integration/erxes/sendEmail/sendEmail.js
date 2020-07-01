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
    var segmentsSidebar = ["customer", "lead", "visitor","company"];
    for(let i=0; i<=3; i++ ){
        cy.url().should('include', '/segments/' + segmentsSidebar[i]);
        

      //   cy.get('#SegmentShowing').find('tr').then(tr => {
      //   //already created segment count
      //     const trCount = Cypress.$(tr).length;

      //     cy.get('#NewSegmentButton').click();

      //     cy.get('input[name=name]').type('a1')
      //     cy.get('input[name=description]').type('testinga1')
      //     cy.get('select[name=subOf]').select('Churn')
      //     cy.get('.sc-fZwumE').click();
      //     cy.get('div > input').clear().type(`#000000`)
      //     cy.get('.sc-fZwumE').click();
      //     cy.get('button[icon=subject]').click({multiple: true})    
      //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(State)').click()
      //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Visitor)').click();
      //     cy.get('button[icon=times]').click({multiple: true})

      //     cy.get('button[icon=computer-mouse]').click()
      //     cy.get('button[icon=check-circle]').click()

      //     cy.log(cy.get('#SegmentShowing > tr').its('length'));
          
      //     //greather than old counted number.
      //     cy.get('#SegmentShowing > tr').should('have.length', trCount + 1);   
          
      // });    
    }
    //cy.get('#SettingsGeneralSettingsFather').children().eq(5).click();
    //cy.url().should('include', '/segments/customer');

    // Segments
    //cy.get('#SegmentSidebar').children().eq(0).click()

    //New segment create customer
    // cy.get('#SegmentShowing').find('tr').then(tr => {
    //     //already created segment count
    //     const trCount = Cypress.$(tr).length;

    //     cy.get('#NewSegmentButton').click();

    //     cy.get('input[name=name]').type('a1')
    //     cy.get('input[name=description]').type('testinga1')
    //     cy.get('select[name=subOf]').select('Churn')
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('div > input').clear().type(`#000000`)
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('button[icon=subject]').click({multiple: true})    
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(State)').click()
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Visitor)').click();
    //     cy.get('button[icon=times]').click({multiple: true})

    //     cy.get('button[icon=computer-mouse]').click()
    //     cy.get('button[icon=check-circle]').click()

    //     cy.log(cy.get('#SegmentShowing > tr').its('length'));
        
    //     //greather than old counted number.
    //     cy.get('#SegmentShowing > tr').should('have.length', trCount + 1);    
    //   });    

    
    // Create Segments Lead
    // cy.get('#SegmentSidebar').children().eq(1).click()
    // cy.url().should('include','/segments/lead')

    //  cy.get('#SegmentShowing').find('tr').then(tr => {
    //     //already created segment count
    //     const trCount = Cypress.$(tr).length;

    //     cy.get('#NewSegmentButton').click();

    //     cy.get('input[name=name]').type('a1')
    //     cy.get('input[name=description]').type('testinga1')
    //     cy.get('select[name=subOf]').select('a1')
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('div > input').clear().type(`#000000`)
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('button[icon=subject]').click({multiple: true})    
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(State)').click()
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Visitor)').click();
    //     cy.get('button[icon=times]').click({multiple: true})

    //     cy.get('button[icon=computer-mouse]').click()
    //     cy.get('button[icon=check-circle]').click()

    //     cy.log(cy.get('#SegmentShowing > tr').its('length'));
        
    //     //greather than old counted number.
    //     cy.get('#SegmentShowing > tr').should('have.length', trCount + 1);    
    //   });    

    //Create Segments Visitor

    // cy.get('#SegmentSidebar').children().eq(2).click()
    // cy.url().should('include','/segments/visitor')

    //  cy.get('#SegmentShowing').find('tr').then(tr => {
    //     //already created segment count
    //     const trCount = Cypress.$(tr).length;

    //     cy.get('#NewSegmentButton').click();

    //     cy.get('input[name=name]').type('a1')
    //     cy.get('input[name=description]').type('testinga1')
    //     cy.get('select[name=subOf]').select('a2')
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('div > input').clear().type(`#000000`)
    //     cy.get('.sc-fZwumE').click();
    //     cy.get('button[icon=subject]').click({multiple: true})    
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(State)').click()
    //     cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Visitor)').click();
    //     cy.get('button[icon=times]').click({multiple: true})

    //     cy.get('button[icon=computer-mouse]').click()
    //     cy.get('button[icon=check-circle]').click()

    //     cy.log(cy.get('#SegmentShowing > tr').its('length'));
        
    //     //greather than old counted number.
    //     cy.get('#SegmentShowing > tr').should('have.length', trCount + 1);    
    //   });    

    // Tags
  //   cy.get('#SettingsGeneralSettingsFather').children().eq(4).click();
  //   cy.url().should('include', '/tags/conversation');
    
  //  for(let i=0; i<=5; i++){
  //     cy.get("#TagsSidebar").children().eq(i).click()
  //     cy.get('#TagsShowing').find('tr').then(tr => {
  //       const trCount = Cypress.$(tr).length;
  //       cy.get('#AddTagButton').click()
  //       cy.get('input[name=name]').type('last3')
  //       cy.get('.sc-cPuPxo').click()
  //       cy.get('[style="position: relative;"] > input').clear().type('#000000')
  //       cy.get('.sc-cPuPxo').click()
  //       cy.get('#AddTagButtons').children().eq(1).click()
  //       cy.get('#TagsShowing > tr').should('have.length', trCount + 1);  
  //     })
  //   }
  });
});
