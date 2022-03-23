export const ACTIONS = {
  WAIT: "wait",
  IF: "if",
  SET_PROPERTY: "setProperty",
  CREATE_TASK: "cards:createTask",
  CREATE_TICKET: "cards:createTicket",
  CREATE_DEAL: "cards:createDeal",
  CUSTOM_CODE: "customCode"
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
