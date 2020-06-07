describe('Login', function(){
    it('Sign in', function(){
        cy.visit('https://acme.app.erxes.io/')
        cy.get('input[name=email]').type('muji.sgs@gmail.com')
        cy.get('input[name="password"]').type('Erxes1234')
        cy.get('.sc-iyvyFf').contains('Sign in').click()
    })
})