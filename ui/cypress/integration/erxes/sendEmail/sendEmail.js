import 'cypress-file-upload';
import { fakeNameCustomer } from "../utils";

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

    //Segment
    // cy.get('#SettingsGeneralSettingsFather').children().eq(5).click();
    // var segmentsSidebar = ["customer", "lead", "visitor","company"];
    // for(let i=0; i<=segmentsSidebar.length; i++ ){
    //     // cy.url().should('include', '/segments/' + segmentsSidebar[i]);
    //     cy.get('#SegmentSidebar').children().eq(i).click()
    //     cy.get('#SegmentShowing').find('tr').then(tr => {
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
    // }
    
    //Tags
    // cy.get('#SettingsGeneralSettingsFather').children().eq(4).click();
    // cy.url().should('include', '/tags/conversation');
    
    // for(let i=0; i<=5; i++){
    //   cy.get("#TagsSidebar").children().eq(i).click()
    //   cy.get('#TagsShowing').find('tr').then(tr => {
    //     const trCount = Cypress.$(tr).length;
    //     cy.get('#AddTagButton').click()
    //     cy.get('input[name=name]').type('last3')
    //     cy.get('.sc-cPuPxo').click()
    //     cy.get('[style="position: relative;"] > input').clear().type('#000000')
    //     cy.get('.sc-cPuPxo').click()
    //     cy.get('#AddTagButtons').children().eq(1).click()
    //     cy.get('#TagsShowing > tr').should('have.length', trCount + 1);  
    //   })
    // }

    //Brand
    // cy.get('#SettingsIntegrationSettingsFather').children().eq(1).click();
    // cy.url().should('include', '/settings/brands');
    // cy.wait(1500)
    // // cy.get('#BrandSidebar').find('li').then(li => {
    // //   const liCount = Cypress.$(li).length;
    // //   cy.get('#NewBrandButton').click()
    // //   cy.get('input').type('asdf')
    // //   cy.get('textarea').type('something')
    // //   cy.get('button[icon=check-circle]').click()
    // //   cy.get('#BrandSidebar > li').should('have.length', liCount + 1); 
    // // })


    // cy.get('#ManageIntegration').click()
    // cy.get('input').type('nani').clear()
    // //cy.get('.modal-body').children().get('i[icon=plus-1]').click({multiple:true})
    // cy.get('.modal-body').within(() => {
    //     cy.get('ul').children().eq(3).click()
    // })
    // cy.get('form > .sc-gGBfsJ > .PFIuR').click()
    // cy.wait(1000)
    // cy.get('.PFIuR').click()
      
  
    //Import & Export
    //cy.get('#SettingsGeneralSettingsFather').children().eq(6).click();
    //cy.get('i[icon=folder-download]').click()
    
    //cy.get('button[icon=user-minus]').click()
    //cy.get('button[icon=checked-1]').click()
    //cy.wait(60000)
    //cy.reload()
    // cy.fixture('customer.xlsx', 'binary')
    //     .then(Cypress.Blob.binaryStringToBlob)
    //     .then(fileContent => {
    //       cy.get('input[type=file]').attachFile({
    //         fileContent,
    //         fileName: 'customer.xlsx',
    //         mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //         encoding: 'utf8'
    //       })
    //     })



    // //Contacts Email Verify
    //   cy.get("#navigation")
    //   .children()
    //   .eq(3)
    //   .click();
    // // random fakename
    // const random = fakeNameCustomer();

    // //Customer Email Verify
    // cy.get('a[href="/contacts/customer"]').click();

    // cy.get('button[icon="plus-circle"]').click();

    // cy.get('input[name="firstName"]').type(random);

    // cy.get('input[placeholder="Add Email"]').type(random + "@nmma.co");

    // cy.get("#customerPrimaryEmailSave")
    //   .children()
    //   .eq(1)
    //   .click();

    // cy.get('button[icon="check-circle"]').click();

    // cy.wait(2000);

    // cy.get('#customers > tr:first').children().eq(4).within(() => {
    //   cy.get('i').then($itag => {
    //     if($itag.hasClass('icon-shield-slash')){
    //       cy.reload()
    //     } else {
    //       cy.log('not verified your email')
    //     }
    //   })
    // });
  
    });
});
