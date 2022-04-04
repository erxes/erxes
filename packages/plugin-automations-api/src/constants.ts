export const ACTIONS = {
  WAIT: "wait",
  IF: "if",
  SET_PROPERTY: "setProperty",
  CREATE_TASK: "cards:task.create",
  CREATE_TICKET: "cards:ticket.create",
  CREATE_DEAL: "cards:deal.create",
  CREATE_VOUCHER: "loyalties:voucher.create",
  CHANGE_SCORE: "loyalties:scoreLog.create"
};

export const TRIGGER_TYPES = {
  LEAD: 'contacts:lead',
  CUSTOMER: 'contacts:customer',
  COMPANY: 'contacts:company',
  DEAL: 'cards:deal',
  TASK: 'cards:task',
  TICKET: 'cards:ticket',
  CONVERSATIONS: 'inbox:conversations',
}
