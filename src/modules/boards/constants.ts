export const STORAGE_BOARD_KEY = 'erxesCurrentBoardId';
export const STORAGE_PIPELINE_KEY = 'erxesCurrentPipelineId';

export const STAGE_CONSTANTS = {
  deal: {
    itemsQuery: 'deals',
    addMutation: 'dealsAdd',
    changeMutation: 'dealsChange',
    updateOrderMutation: 'dealsUpdateOrder',
    addText: 'Add a deal',
    successText: 'You successfully added a deal'
  },
  ticket: {
    itemsQuery: 'tickets',
    addMutation: 'ticketsAdd',
    changeMutation: 'ticketsChange',
    updateOrderMutation: 'ticketsUpdateOrder',
    addText: 'Add a ticket',
    successText: 'You successfully added a ticket'
  }
};
