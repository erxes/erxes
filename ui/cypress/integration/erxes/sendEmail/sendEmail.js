import 'cypress-file-upload';
import { SignIn, fakeNameCustomer, fakeName, waitAndClick } from "../utils";

SignIn;

context('Send Email Verification', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Sign In', () => {
    cy.signIn();

    cy.url().should('include', '/inbox');
    cy.getCookie('auth-token').should('exist');
    cy.get('#Settings').click();
    cy.url().should('include', '/settings');

    // General Settings Main
    cy.get('#SettingsGeneralSettings').children().should('have.length', 12);

    //Segment
    cy.get('#SettingsGeneralSettings').children().eq(5).click();
    var segmentsSidebar = ["customer", "lead", "visitor","company"];
    for(let i=0; i<segmentsSidebar.length; i++){
      cy.get('#SegmentSidebar').children().eq(i).click()
      cy.url().should('include', '/segments/' + segmentsSidebar[i]);

      cy.wait(1000)
      cy.get('body').then(($body) => {
        if ( $body.find('tr').length ){
          return $body.find('tbody').find('tr').length;
        }
        return 0;
      })
        .then ( trCount => {
          cy.get('#NewSegmentButton').click();

          cy.get('input[name=name]').type('a1');
          cy.get('input[name=description]').type('testinga1');
          // cy.get('select[name=subOf]').select('Active users');
          cy.get('div[id=segment-color]').click();
          cy.get('div > input').clear().type(`#000000`)
          cy.get('div[id=segment-color]').click();
          cy.get('button[icon=subject]').click({multiple: true})
          cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Created)').click()
          cy.get('#segment-select-operator').select('is set')
          cy.get('button[icon=times]').click({multiple: true})

          cy.get('button[icon=computer-mouse]').click()
          cy.get('button[icon=check-circle]').click()

          //greather than old counted number.
          cy.get('#SegmentShowing > tr').should('have.length', trCount + 1);
          cy.wait(1000)
        });
    }

    // Tags
    cy.get('#Settings').click();
    cy.get('#SettingsGeneralSettings').children().eq(4).click();
    cy.url().should('include', '/tags/conversation');

    for(let i=0; i<=4; i++){
      cy.get("#TagsSidebar").children().eq(i).click()
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ( $body.find('tr').length ){
          return $body.find('tbody').find('tr').length;
        }
        return 0;
      })
        .then(trCount => {
          cy.get('#AddTagButton').click()
          cy.get('input[name=name]').type('last3' + i + fakeName(1))
          cy.get('label').contains('Color').parent().children().eq(1).click();
          cy.get('[style="position: relative;"] > input').clear().type('#000000')
          cy.get('label').contains('Color').parent().children().eq(1).click();
          cy.get('#AddTagButtons').children().eq(1).click()
          cy.get('#TagsShowing > tr').should('have.length', trCount + 1);
        })
    }

    // Brand
    cy.get('#Settings').click();
    cy.get('#SettingsIntegrationSettings').children().eq(1).click();
    cy.url().should('include', '/settings/brands');
    cy.wait(1500)
    cy.get('#BrandSidebar').find('li').then(li => {
      const liCount = Cypress.$(li).length;
      cy.get('#NewBrandButton').click();
      cy.get('input').eq(0).type(fakeName(7));
      cy.get('textarea').type('something');
      cy.get('button[icon=check-circle]').click();
      cy.get('#BrandSidebar > li').should('have.length', liCount + 1);
    })
    cy.get('#BrandSidebar').children().eq(0).click();

    cy.get('#ManageIntegration').click()
    cy.get('input').type('nani').clear()
    //cy.get('.modal-body').children().get('i[icon=plus-1]').click({multiple:true})
    cy.wait(3000)
    cy.get('.modal-body').within(() => {
        cy.get('ul').children().eq(0).click()
    })
    cy.get('form').get('button[type="submit"]').click()
    cy.wait(1000)
    cy.get('button[icon="check-circle"]').click()

    // Import & Export
    cy.get('#Settings').click();
    cy.get('#SettingsGeneralSettings').children().eq(6).click();

    const hasDownloadsIndexs = [2, 3, 4, 6];
    for(let i=0; i<11; i++){
      cy.get('#ImportExportSidebar').children().eq(i).click()
      if (hasDownloadsIndexs.includes(i)) {
        waitAndClick('i[icon=folder-download]');
        cy.wait(1000);
        cy.get('button').contains('Cancel').click();
      }
      cy.wait(1000);
    }

    cy.get('#navigation').children().eq(3).click()
    cy.get('a[href="/contacts/customer"]').click()
    cy.get('#customers').find('tr')
      .then(tr => {
        //already created segment count
        const trCount = Cypress.$(tr).length;
        cy.get('#Settings').click()
        cy.get('#SettingsGeneralSettings').children().eq(6).click();

        //file upload
        cy.fixture('customer.xlsx', 'binary')
          .then(Cypress.Blob.binaryStringToBlob)
          .then(fileContent => {
            cy.get('input[type=file]').attachFile({
              fileContent,
              fileName: 'customer.xlsx',
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              encoding: 'utf8'
            })
        })
        cy.wait(3000);
        cy.reload();
        cy.get('#navigation').children().eq(3).click()
        cy.get('a[href="/contacts/customer"]').click()

        // cy.get('#customers > tr').should('have.length', trCount + 1);
        cy.wait(1000)

      });

    //Contacts Email Verify
      cy.get("#navigation")
      .children()
      .eq(3)
      .click();
    // random fakename
    const random = fakeNameCustomer();

    //Customer Email Verify
    cy.get('a[href="/contacts/customer"]').click();

    cy.get('button[icon="plus-circle"]').click();

    cy.get('input[name="firstName"]').type(random);

    cy.get('div .Select-placeholder').contains('Enter an email').click().type(random + "@nmma.co");
    cy.get('div .Select-menu-outer').click();

    cy.get('button[icon="check-circle"]').click();

    cy.wait(2000);

    cy.get('#customers > tr:first').children().eq(4).within(() => {
      cy.get('i').then($itag => {
        if($itag.hasClass('icon-shield-slash')){
          cy.reload()
        } else {
          cy.log('not verified your email')
        }
      })
    });
  });
});
