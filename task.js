import {SignIn, fakeName, waitTilDisappear, waitAndClick} from '../utils';

SignIn;

context("Task", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Task", () => {
        cy.signIn(); 
        cy.get('a[href="/task"]').click();
        cy.get('i[class="icon-cog sc-bdVaJa cUgreV"]').click();

        // //click add board button
        // cy.get('button[class="sc-kEYyzF UFXDA"]').click();

        // //add board
        // const random = fakeName(7);
        // cy.get('input[name="name"]').type(random);
        // cy.get('button[class="sc-kEYyzF evWbNU"]').click();
        
        //click add board button
        cy.get('button[class="sc-kEYyzF UFXDA"]').click();

        //add board
        const random = fakeName(7);
        cy.get('input[name="name"]').type(random);
        cy.get('button[class="sc-kEYyzF evWbNU"]').click();

        //click add pipeline
        cy.get('button[class="sc-kEYyzF imKlMv"]').click();
        cy.get('input[name="name"]').eq(0).type(fakeName(7));

        //select color
        cy.get('div[class="sc-dyGzUR jygrrV"]').click();
        cy.get('[style="position: relative;"] > input').clear().type('#F7CE53');
        //cy.get('div[class="sc-dyGzUR jygrrV"]').then(backgroundColor =>{
        //    const length = backgroundColor.length
        //    const random = Math.floor(Math.random()* length-1);
        //    cy.get('div[class="sc-dyGzUR jygrrV"]').eq(random).click()
        //})
//class="sc-hBbWxd bPqemo" ar
        //select visibility
        cy.get('select[name="visibility"]').select('public');
        //cy.get('span[class="Select-value-label"]');

        //TODO: comment
        cy.get('.Select-value').click()
        cy.get('.Select-option').then(boardComboItem => {
            const length = boardComboItem.length
            const random = Math.floor(Math.random() * length - 1);   

            cy.get('.Select-option').eq(random).click()
        })

        cy.get('input[class="sc-jWBwVP iDTCDb"]').eq(1).type(fakeName(6));
        cy.get('select[name="probability"]').select('20%');
        cy.get('select[name="status"]').select('active');

        cy.get('button[type="submit"]').click();

        // cy.get('button[icon="cancel-1"]').eq(0).click();
     
        //cy.get('a[href="/settings/boards/task?boardId=4zmesbK58XTXxJg9j"]').click()
        //cy.get('a[class="sc-dRaagA eQNptr"]').click();
        //cy.get('input[class="sc-jWBwVP iDTCDb"]').eq(2).type(fakeName(6));
       // cy.get('select[name="probability"]').eq(2).select('30%');
        //cy.get('select[name="status"]').select('active');
        //cy.get('#testingDropdown').children();
        
        
  });
        //cy.get('button[class="sc-kEYyzF cfPPYD" icon="cancel-1" type="button"]').click();
});
    
    


