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

        // click add board button
        // cy.get('button[class="sc-kEYyzF UFXDA"]').click();

        // add board
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
        
        //select visibility
        cy.get('select[name="visibility"]').select('public');
    

        //select random value from dropdownlist (board)
        cy.get('.Select-value').click()
        cy.get('.Select-option').then(boardComboItem => {
            const length = boardComboItem.length
            const random = Math.floor(Math.random() * length - 1);   
            cy.get('.Select-option').eq(random).click()
        })

        //add stages
        cy.get('input[class="sc-jWBwVP iDTCDb"]').eq(1).type(fakeName(6));
        cy.get('select[name="probability"]').select('20%');
        cy.get('select[name="status"]').select('active');

        cy.get('button[type="submit"]').click();    
        
        cy.get('i[icon="file-check-alt"]').click();

        cy.get('i[class="icon-angle-down sc-bdVaJa cUgreV').eq(0).click({multiple: true});
        //cy.get('.dropdown-menu').then(dropDownMenu => {
            //const length = dropDownMenu.lenngth
            //const random = Math.floor(Math.random() * length-1 );
        cy.get('.dropdown-menu show').eq(1).click()
        //})
  });       
});
    
    


