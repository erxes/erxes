import 'cypress-file-upload';
import { SignIn, waitTilDisappear } from "../utils";

SignIn;

context('Segments', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Segments', () => {
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

        cy.get('#NewSegmentButton').click();

        cy.get('input[name=name]').type('a1');
        cy.get('input[name=description]').type('testinga1');
        cy.get('div[id=segment-color]').click();
        cy.get('div > input').clear().type(`#000000`)
        cy.get('div[id=segment-color]').click();
        cy.get('button[icon=subject]').click({multiple: true})

        cy.get('div.Select-placeholder:first').click()
        cy.get('.Select-option:contains(Created)').click()

        cy.get('#segment-select-operator').select('is set')
        cy.get('button[icon=times]').click({multiple: true})

        cy.get('button[icon=computer-mouse]').click()
        cy.get('button[icon=check-circle]').click()

        waitTilDisappear('button[icon=check-circle]')
    }
  });
});
