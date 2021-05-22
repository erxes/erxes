import {SignIn, fakeName, waitTilDisappear, waitAndClick} from '../utils';

SignIn;

context("knowledgeBase", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("knowledgeBase", () => {
        cy.signIn();
        
        cy.get('a[href="/knowledgeBase"]').click();
        cy.get('button[class="sc-kEYyzF imKlMv"]').click()
        
        const random = fakeName(10)

        cy.get('input[name="title"]').type(random)

        cy.get('input[name="summary"]').type(random)

        cy.get('select[name="status"]').select('draft')

        cy.get('i[icon="check-circle"]').click()
        //cy.get('input[role="presentation"]').type(random)

        //cy.get('div[class="Select is-clearable is-searchable Select--multi"]').click()
        //cy.get('div[class="Select-control"]').then(reactions => {
        //    const length = reactions.length
        //    const random = Math.floor(Math.random() * length)
        //    cy.get('dic[class="Select-control"]').eq(random).click()
        //})
        //cy.get('.Select-control').eq(1).click()
    })
})