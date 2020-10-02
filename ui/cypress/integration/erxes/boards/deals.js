import { SignIn, fakeName } from '../utils';

SignIn;

context('Check Deals', () => {
  beforeEach(() => {
    cy.visit('/deal');
  });

  it('Deals', () => {
    cy.signIn();

    cy.get('a[href="/settings"]').click();

    cy.get('#SettingsSalesPipelineSettings > :nth-child(1) > a').click();

    cy.url().should('include', '/settings/boards/deal');

    const createdBoardsCount = 0;
    const newBoardName = 'board-' + fakeName(10);
    // const newBoardName = 'board-VETQA5T6df'
    const pipelineNames = [];

    cy.get('section').eq(0).find('a').then((a) => {
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
      cy.wait(1000);
      cy.get('section').eq(0).find('a').should('have.length', createdBoardsCount + 1);
    });

    cy.get('section').eq(0).within(() => {
      cy.get('a').contains(newBoardName).click();
    })

    let pipelineIndex = 0;
    const pipelinesCount = 3
    const perStagesCount = 2;
    let setStagesState = true

    // add pipelines
    while (pipelineIndex < pipelinesCount) {
      cy.get('div[id="pipelines-content"]').within(() => {
        cy.get('button[icon="plus-circle"]').click();
      })

      const addPipelineForm = cy.get('div[id="manage-pipeline-modal"]');

      addPipelineForm.within(() => {
        const newPipelineName = 'pipeline-' + fakeName(10);
        cy.get('input[name="name"]').eq(0).type(newPipelineName);

        cy.get('div[id="stages-in-pipeline-form"]').children().eq(0).within(() => {
          if (setStagesState) {
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
            setStagesState = false;
          }
        })
        cy.get('button[type="submit"]').click();
        pipelineNames.push(newPipelineName);
      });

      pipelineIndex = pipelineIndex + 1;
    }

    cy.get('a[href="/deal"]').click();
    cy.reload();
    cy.wait(5000);
    cy.get('a').contains('Sales pipeline').then(() => {
      cy.get('body').find('section').find('#board-pipeline-header');
    })
    cy.get('div[class="dropdown"]').should('have.length', 3);

    // cy.get('#board-pipeline-header').find('div[class="dropdown"]').should('have.length', 2);
    // cy.wait(2000);
    // // cy.get('#board-pipeline-header').find('div[class="dropdown"]').eq(0).click();
    // cy.get('div[class="dropdown"]').eq(1).click();
    // cy.wait(1000);
    // // cy.get('#board-pipeline-header').find('div[class="show dropdown"]').contains(newBoardName).click();
    // cy.get('div[class="show dropdown"]').contains(newBoardName).click();

    // cy.get('#board-pipeline-header').find('div[class="dropdown"]').eq(1).click();
    // cy.wait(1000);
    // const pipelineDropDown = cy.get('#board-pipeline-header').find('div[class="dropdown-menu show"]').children();
    // pipelineDropDown.should('have.length', pipelinesCount - 1);
    // pipelineDropDown.eq(pipelinesCount - 2).click();
    // cy.wait(8000);

    // // add deal
    // cy.get('i[icon="plus-1"]').eq(0).click();

    // const dealName = 'deal-' + fakeName(8);
    // cy.get('div[class="modal-body"]').within(() => {
    //   cy.get('input').eq(0).type(dealName);
    //   cy.get('button[type="submit"]').click();
    // });

  });

});
