import { fakeName } from '../utils';

context('Check Deals', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
  });

  it('Deals', () => {
    const email = Cypress.env('userEmail');
    const password = Cypress.env('userPassword');

    cy.get('input[name=email]').type(email);
    cy.get('input[name=password]').type(`${password}{enter}`);

    cy.url().should('include', '/inbox');
    cy.getCookie('auth-token').should('exist');

    cy.get('title').should('contain', 'Conversation');

    cy.get('button[id="robot-get-started"]').click()

    cy.get('div[id="robot-features"]').children().should('have.length', 9)
    cy.get('button[id="robot-get-started"]').should('be.disabled')


    cy.get('div[id="robot-item-inbox"]').click();
    cy.get('div[id="robot-item-contacts"]').click();
    cy.get('div[id="robot-item-integrations"]').click();


    cy.get('button[id="robot-get-started"]').click();
    cy.get('div[id="robot-feature-close"]').click();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsSalesPipelineSettingsFather > :nth-child(1) > a').click();

    const createdBoardsCount = 0;
    const newBoardName = fakeName(10);

    cy.get('div[id="boardSidebar"]').within(() => {
      // header and content 2 div
      cy.get('section').children().should('have.length', 2);

      cy.get('section').children().eq(1).find('a').then((a) => {
        // already created boards count
        const aCount = Cypress.$(a).length;
        cy.wrap(aCount).as('createdBoardsCount');

        // new board
        cy.get('section').children().eq(0).click();
      })
    })

    cy.get('div[class="modal-body"]').get('input').type(newBoardName);
    cy.get('div[class="modal-body"]').get('button[type="submit"]').click();

    // added 1 board
    cy.get('@createdBoardsCount').then((createdBoardsCount) => {
      cy.get('div[id="boardSidebar"]').within(() => {
        cy.get('section').children().eq(1).find('a').should('have.length', createdBoardsCount + 1);
      })
    });

  });

});
