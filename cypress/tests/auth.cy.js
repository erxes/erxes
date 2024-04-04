describe("User sign up and login", () => {
    beforeEach(() => {
        cy.exec('yarn run cypress:seedDB');
        Cypress.Cookies.debug(true);
        cy.visit('/');
        cy.clearCookies();
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        })
    });

    it("should redirect unauthenticated user to signin page", function () {
        cy.visit("/contacts/customer");
        cy.get('button.sc-bRBYWo',{timeout: 300000}).should("be.visible");
        // cy.visualSnapshot("Redirect to SignIn");
    });

    it("input error message", () => {

        cy.get('input[name=email]',{timeout:300000}).type("{enter}");
        cy.get('label.sc-frDJqD').should('be.visible')
    })

    it("Login", () => {
        const email = Cypress.env('userEmail');
        const password = Cypress.env('userPassword');
        cy.login(email, password)
    })

})