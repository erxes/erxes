/// <reference types="cypress" />

describe('Settings Check', () => {
    it('Sign In', () => {
        cy.visit('/')
        const email = Cypress.env('userEmail');
        const password = Cypress.env('userPassword');

        cy.get('input[name=email]').type(email);
        cy.get('input[name=password]').type(`${password}{enter}`);
    })

    it('Settings', () => {
        cy.get('#Settings').click();
        //General Settings Main
        cy.get('#SettingsGeneralSettingsFather').children().should('have.length',9).eq(0).click()
        //General System config
        //General Settings
        cy.get('#SettingsSidebar').children().should('have.length',3).eq(0).click()
        cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8).eq(0).click()
        cy.get('div.Select-value:first').click().get('.Select-option:contains(Italian)').click();
        cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Afghan)').click()
        cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Bag)').click()
        cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(0).children().should('have.length',2).eq(0).click()
        //File upload
        cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8).eq(1).click()
        cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Icon)').click()
        cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Tagged Image File Format)').click()
        cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Amazon)').click()
        cy.get('#GeneralSettingsMenuFather > div.Select-value:first').click().get('.Select-option:contains(Private)').click();



        //Integrations config
        //cy.get('#SettingsSidebar').children().should('have.length',3).eq(1).click()
        // Engage config
        //cy.get('#SettingsSidebar').children().should('have.length',3).eq(2).click()


    })
})
