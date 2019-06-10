export const STORAGE_BOARD_KEY = 'erxesCurrentBoardId';
export const STORAGE_PIPELINE_KEY = 'erxesCurrentPipelineId';

export const STAGE_CONSTANTS = {
  deal: {
    title: 'Deals',
    itemsQuery: 'deals',
    detailQuery: 'dealDetail',
    addMutation: 'dealsAdd',
    editMutation: 'dealsEdit',
    removeMutation: 'dealsRemove',
    changeMutation: 'dealsChange',
    updateOrderMutation: 'dealsUpdateOrder',
    addText: 'Add a deal',
    addSuccessText: 'You successfully added a deal',
    updateSuccessText: 'You successfully updated a deal',
    deleteSuccessText: 'You successfully deleted a deal',
    copySuccessText: 'You successfully copied a deal'
  },
  ticket: {
    title: 'Tickets',
    itemsQuery: 'tickets',
    detailQuery: 'ticketDetail',
    addMutation: 'ticketsAdd',
    editMutation: 'ticketsEdit',
    removeMutation: 'ticketsRemove',
    changeMutation: 'ticketsChange',
    updateOrderMutation: 'ticketsUpdateOrder',
    addText: 'Add a ticket',
    addSuccessText: 'You successfully added a ticket',
    updateSuccessText: 'You successfully updated a ticket',
    deleteSuccessText: 'You successfully deleted a ticket',
    copySuccessText: 'You successfully copied a deal'
  }
};
