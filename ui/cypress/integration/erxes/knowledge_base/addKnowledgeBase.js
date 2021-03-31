import {SignIn, fakeName, waitTilDisappear, waitAndClick} from '../utils';

SignIn;

context("knowledgeBase", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("knowledgeBase", () => {
        cy.signIn();
        cy.get('a[href="/knowledgeBase"]').click();
        cy.get('i[icon="plus-circle"]').click()

        const random = fakeName(6)
        cy.get('input[name="title"]').type(random)
        cy.get('input[name="description"]').type(random)
        cy.get('button[class="sc-kEYyzF imKlMv"]').eq(1).click({multiple:true})
        cy.get('input[name="name"]').type(random)
        cy.get('textarea[name="description"]').type(random)
        cy.get('button[class="sc-kEYyzF evWbNU"]').eq(1).click()

        cy.get('select[name="brandId"]').select(random)

        cy.get('select[name="languageCode"]').select('English')

        
        cy.get('div[class="sc-dyGzUR jygrrV"]').click();
        cy.get('[style="position: relative;"] > input').clear().type('#EB144C');

        cy.get('button[type="submit"]').click()

        cy.get('i[icon="cog"]').eq(1).click()
        cy.get('a[class="dropdown-item"]').eq(1).click()

        cy.get('input[name="title"]').type(random)
        cy.get('input[name="description"]').type(random)
        cy.get('div[class="Select is-clearable is-searchable Select--single"]').click()
        
        cy.get('div[class="icon-option"]').then(comboItem => {
            const length = comboItem.length
            const random = Math.floor(Math.random() * length -1)
            cy.get('.icon-option').eq(random).click()
        })
        
        cy.get('button[type="submit"]').click()

        cy.get('i[icon="cog"]').eq(1).click()
        cy.get('a[class="dropdown-item"]').eq(0).click()

        cy.get('button[class="sc-kEYyzF bvXuMy"]').click()
        
        cy.get('button[icon="check-circle"]').eq(1).click()
        
    })
})
