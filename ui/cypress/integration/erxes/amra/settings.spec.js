/// <reference types="cypress" />

describe('Settings Check', () => {
    it('Visits the Kitchen Sink', () => {
        cy.visit('/')
        const email = Cypress.env('userEmail');
        const password = Cypress.env('userPassword');

        cy.get('input[name=email]').type(email);
        cy.get('input[name=password]').type(`${password}{enter}`);
    })
})
