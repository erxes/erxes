import { Login } from '../auth/SignIn'

describe('Settings Check', () => {
  beforeEach(() => {
    Login
  })

  it('Settings', () => {
    cy.get('#Settings').click();
    cy.url().should('include','/settings')
    // General Settings Main
    cy.get('#SettingsGeneralSettingsFather').children().should('have.length',9).eq(0).click()
    // General System config
    // General Settings
    // cy.get('#SettingsSidebar').children().should('have.length',3).eq(0).click()
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8).eq(0).click()
    // cy.get('div.Select-value:first').click().get('.Select-option:contains(Italian)').click();
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Afghan)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Bag)').click()
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(0).children().should('have.length',2).eq(0).click()
    // //File upload
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length', 8).eq(1).click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Icon)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Tagged Image File Format)').click()
    // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Amazon)').click()
    // cy.get('#react-select-8--value > .Select-value').click().get('.Select-option:contains(Private)').click();
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(1).children().should('have.length',2).eq(0).click()
    // Google Cloud Storage
    // const blah = cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(2).click();
    // blah.find('input').type('amra');
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(2).children().should('have.length',2).eq(0).click()
    // AWS S3
    // cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(3).click();
    const awss3 = cy.get('#GeneralSettingsMenuFather').children().should('have.length',8).eq(3).click();
    // awss3.find('input').should('have.length',6).eq(0).type('blah')
    cy.get('.dJEUCp > .collapse > .sc-dyGzUR > :nth-child(2) > .sc-hXRMBi > .sc-kfGgVZ').type('blah')
    cy.get('.dJEUCp > .collapse > .sc-dyGzUR > :nth-child(3) > .sc-hXRMBi > .sc-kfGgVZ').type('blah')
    cy.get('.dJEUCp > .collapse > .sc-dyGzUR > :nth-child(4) > .sc-hXRMBi > .sc-kfGgVZ').type('blah')
    cy.get('.dJEUCp > .collapse > .sc-dyGzUR > :nth-child(5) > .sc-hXRMBi > .sc-kfGgVZ').type('blah')
    cy.get('.dJEUCp > .collapse > .sc-dyGzUR > :nth-child(6) > .sc-hXRMBi > .sc-kfGgVZ').type('blah')

    //
    // //Integrations config
    // //cy.get('#SettingsSidebar').children().should('have.length',3).eq(1).click()
    // // Engage config
    // //cy.get('#SettingsSidebar').children().should('have.length',3).eq(2).click()
    //

  })
})
