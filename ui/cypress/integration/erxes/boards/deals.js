import { SignIn, fakeName } from '../utils';

SignIn;

context('Check Deals', () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
  });

  it('Deals', () => {
    cy.signIn();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsSalesPipelineSettingsFather > :nth-child(1) > a').click();

    cy.url().should('include', '/settings/boards/deal');

    const createdBoardsCount = 0;
    const newBoardName = 'board-' + fakeName(10);
    const pipelineNames = [];

    cy.get('section').find('a').then((a) => {
      // already created boards count
      const aCount = Cypress.$(a).length;
      cy.wrap(aCount).as('createdBoardsCount');

      // new board
      cy.get('section').children().eq(0).click();
    })

    cy.get('div[class="modal-body"]').get('input').type(newBoardName);
    cy.get('div[class="modal-body"]').get('button[type="submit"]').click();

    // added 1 board
    cy.get('@createdBoardsCount').then((createdBoardsCount) => {
      cy.wait(3000);
      cy.get('section').find('a').should('have.length', createdBoardsCount + 1);
    });

    cy.get('section').within(() => {
      cy.get('a').contains(newBoardName).click();
    })

    let pipelineIndex = 0;
    const pipelinesCount = 3
    const perStagesCount = 2;
    while (pipelineIndex < pipelinesCount) {
      cy.get('div[id="pipelines-content"]').within(() => {
        cy.get('button[icon="plus-circle"]').click();
      })

      const addPipelineForm = cy.get('div[id="manage-pipeline-modal"]');

      addPipelineForm.within(() => {
        const newPipelineName = 'pipeline-' + fakeName(10);
        cy.get('input[name="name"]').eq(0).type(newPipelineName);

        cy.get('div[id="stages-in-pipeline-form"]').children().eq(0).within(() => {
          cy.get('input[name="name"]').eq(0).type('stage 0');

          let index = 1;
          while (index < perStagesCount) {
            cy.get('a').contains('Add another stage').click();
            cy.get('input[name="name"]').eq(index).type(`stage ${index}`);
            cy.get('select[name="probability"]').eq(index).select(`${(index + 1) * 10}%`);
            index = index + 1;
          }

          cy.get('a').contains('Add another stage').click();
          cy.get('input[name="name"]').eq(perStagesCount).type(`stage won`);
          cy.get('select[name="probability"]').eq(perStagesCount).select(`Won`);

          cy.get('a').contains('Add another stage').click();
          cy.get('input[name="name"]').eq(perStagesCount + 1).type(`stage lost`);
          cy.get('select[name="probability"]').eq(perStagesCount + 1).select(`Lost`);
        })
        cy.get('button[type="submit"]').click();
        pipelineNames.push(newPipelineName);
      });

      // todo: remove 2 row
      cy.reload();
      // cy.get('section').find('a').eq(0).click()
      // cy.get('section').find('a').contains(newBoardName).click();

      pipelineIndex = pipelineIndex + 1;
    }

    cy.get('a[href="/deal"]').click();

    const boardSelector = cy.get('div[id="board-pipeline-header"]');
    boardSelector.find('div[class="dropdown"]').eq(0).click();
    boardSelector.find('div[class="dropdown-menu show"]').contains(newBoardName).click();

    cy.wait(1000);

    const boardSelector = cy.get('div[id="board-pipeline-header"]');
    // boardSelector.find('div[class="dropdown"]').contains(pipelineNames[0]).click();
    boardSelector.find('div[class="dropdown"]').eq(1).click();

    const pipelineDropDown = boardSelector.find('div[class="dropdown-menu show"]').children();
    pipelineDropDown.should('have.length', pipelinesCount - 1);
    pipelineDropDown.eq(pipelinesCount - 2).click();
    cy.wait(3000);

    // add deal
    // const addDealLinks = cy.get('')cy.get('a').contains('include', 'Add a deal');
    // addDealLinks.should('have.length', perStagesCount + 2);

    // addDealLinks.eq(0).click();

    // cy.get('div[class="modal-body"] > input').type('deal1');

  });

});
