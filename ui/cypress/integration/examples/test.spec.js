/// <reference types="cypress" />

context('Login', () => {
    beforeEach(() => {
        Cypress.Cookies.debug(true);
        cy.visit('http://localhost:3000');
        cy.viewport(1378, 980)
        cy.clearCookies();
    })

    it('Testing', () => {
        const email = "admin@erxes.io";
        const password = "djqNyypvSi";

        cy.get('input[name=email]').type(email);
        cy.get('input[name=password]').type(`${password}{enter}`);
        const randomNumber = Math.floor(Math.random() * 8);


        cy.url().should('include', '/inbox');
        cy.getCookie('auth-token').should('exist');

        cy.get('#settings').click();


        //General system config
        cy.get('#SystemConfig').children().should('have.length', 9).eq(0).click();
        //General Settings
        // cy.get('#GeneralSystemConfigFather').children().should('have.length', 8).eq(0).click();
        // cy.get('div.Select-value:first').click().get('.Select-option:contains(Italian)').click();
        // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Afghan)').click();
        // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Bag)').click();
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(0).children().should('have.length',2).eq(0).click();
        //
        // //File upload
        // cy.get('#GeneralSystemConfigFather').children().should('have.length', 8).eq(1).click();
        // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Icon)').click();
        // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Tagged Image File Format)').click();
        // cy.get('div.Select-placeholder:first').click().get('.Select-option:contains(Amazon)').click();
        // cy.get('#react-select-8--value > .Select-value').click().get('.Select-option:contains(Public)').click();
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(1).children().should('have.length',2).eq(0).click();
        // //
        // //
        // // //Google cloud storage
        // cy.get('#GeneralSystemConfigFather').children().should('have.length', 8).eq(2).click();
        // const getting = cy.get('#GeneralSystemConfigFather').children().should('have.length', 8).eq(2).click();
        // const googlestorage = getting.children().should('have.length',2).eq(1)
        //     .children().should('have.length',1)
        //     .children().should('have.length',2).eq(1).click()
        //     .children().should('have.length',2).eq(1).click().children().should('have.length',2).eq(1)
        //     .children().should('have.length',1).eq(0).type('something');
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(2).children().should('have.length',2).eq(0).click();
        // // //AWS S3
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(3).click();
        // cy.get(':nth-child(4) > .collapse > .sc-hBbWxd > :nth-child(2) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(4) > .collapse > .sc-hBbWxd > :nth-child(3) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(4) > .collapse > .sc-hBbWxd > :nth-child(4) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(4) > .collapse > .sc-hBbWxd > :nth-child(5) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(4) > .collapse > .sc-hBbWxd > :nth-child(6) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(7) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(3).children().should('have.length',2).eq(0).click();
        // //
        // // // AWS SES
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(4).click();
        // cy.get(':nth-child(5) > .collapse > .sc-hBbWxd > :nth-child(2) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(5) > .collapse > .sc-hBbWxd > :nth-child(3) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(5) > .collapse > .sc-hBbWxd > :nth-child(4) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(5) > .collapse > .sc-hBbWxd > :nth-child(5) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(4).children().should('have.length',2).eq(0).click();
        // //
        // // //Google
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(5).click();
        // cy.get(':nth-child(6) > .collapse > .sc-hBbWxd > :nth-child(2) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(6) > .collapse > .sc-hBbWxd > :nth-child(3) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(6) > .collapse > .sc-hBbWxd > :nth-child(4) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(6) > .collapse > .sc-hBbWxd > :nth-child(5) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(6) > .collapse > .sc-hBbWxd > :nth-child(6) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(5).children().should('have.length',2).eq(0).click();
        // //
        // // //Common Mail config
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(6).click();
        // cy.get(':nth-child(7) > .collapse > .sc-hBbWxd > :nth-child(2) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(7) > .collapse > .sc-hBbWxd > :nth-child(3) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(6).children().should('have.length',2).eq(0).click();
        // // //Custom mail service
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(7).click();
        // cy.get(':nth-child(8) > .collapse > .sc-hBbWxd > :nth-child(2) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(8) > .collapse > .sc-hBbWxd > :nth-child(3) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(8) > .collapse > .sc-hBbWxd > :nth-child(4) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(8) > .collapse > .sc-hBbWxd > :nth-child(5) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get(':nth-child(8) > .collapse > .sc-hBbWxd > :nth-child(6) > .sc-kxynE > .sc-iGrrsa').type('Something')
        // cy.get('#GeneralSystemConfigFather').children().should('have.length',8).eq(7).children().should('have.length',2).eq(0).click();

        //Integration Config
        cy.get('#SystemConfigSidebar').children().should('have.length',3).eq(1).click()





    })
});