///<reference types="cypress"/>
context('Forgot',() => {
    beforeEach(() => {
        cy.visit('/')
        cy.clearCookies()
    })
    it('forgot password', () => {
        cy.get("a")
             .contains("Forgot password?").click()
        cy.get("input").type("admin@erxes.io")
            .should('have.value','admin@erxes.io')
        cy.get("button[type= 'submit']").click()
    })
});