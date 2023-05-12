export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const PRODUCT_TEMPLATE_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived']
};
export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export const PRODUCT_SUPPLY = {
  UNIQUE: 'unique',
  LIMITED: 'limited',
  UNLIMITED: 'unlimited',
  ALL: ['unique', 'limited', 'unlimited']
};

export const VISIBLITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ALL: ['public', 'private']
};

export const HACK_SCORING_TYPES = {
  RICE: 'rice',
  ICE: 'ice',
  PIE: 'pie',
  ALL: ['rice', 'ice', 'pie']
};

export const PROBABILITY = {
  TEN: '10%',
  TWENTY: '20%',
  THIRTY: '30%',
  FOURTY: '40%',
  FIFTY: '50%',
  SIXTY: '60%',
  SEVENTY: '70%',
  EIGHTY: '80%',
  NINETY: '90%',
  WON: 'Won',
  LOST: 'Lost',
  DONE: 'Done',
  RESOLVED: 'Resolved',
  ALL: [
    '10%',
    '20%',
    '30%',
    '40%',
    '50%',
    '60%',
    '70%',
    '80%',
    '90%',
    'Won',
    'Lost',
    'Done',
    'Resolved'
  ]
};

export const BOARD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived']
};

export const BOARD_STATUSES_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' }
];

export const TIME_TRACK_TYPES = {
  STARTED: 'started',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ALL: ['started', 'stopped', 'paused', 'completed']
};

export const BOARD_TYPES = {
  DEAL: 'deal',
  TICKET: 'ticket',
  PURCHASE: 'purchase',
  COST: 'cost',
  TASK: 'task',
  GROWTH_HACK: 'growthHack',
  ALL: ['deal', 'ticket', 'purchase', 'cost', 'task', 'growthHack']
};

export const NOTIFICATION_TYPES = {
  DEAL_ADD: 'dealAdd',
  DEAL_REMOVE_ASSIGN: 'dealRemoveAssign',
  DEAL_EDIT: 'dealEdit',
  DEAL_CHANGE: 'dealChange',
  DEAL_DUE_DATE: 'dealDueDate',
  DEAL_DELETE: 'dealDelete',
  PURCHASE_ADD: 'purchaseAdd',
  PURCHASE_REMOVE_ASSIGN: 'purchaseRemoveAssign',
  PURCHASE_EDIT: 'purchaseEdit',
  PURCHASE_CHANGE: 'purchaseChange',
  PURCHASE_DUE_DATE: 'purchaseDueDate',
  PURCHASE_DELETE: 'purchaseDelete',
  GROWTHHACK_ADD: 'growthHackAdd',
  GROWTHHACK_REMOVE_ASSIGN: 'growthHackRemoveAssign',
  GROWTHHACK_EDIT: 'growthHackEdit',
  GROWTHHACK_CHANGE: 'growthHackChange',
  GROWTHHACK_DUE_DATE: 'growthHackDueDate',
  GROWTHHACK_DELETE: 'growthHackDelete',
  TICKET_ADD: 'ticketAdd',
  TICKET_REMOVE_ASSIGN: 'ticketRemoveAssign',
  TICKET_EDIT: 'ticketEdit',
  TICKET_CHANGE: 'ticketChange',
  TICKET_DUE_DATE: 'ticketDueDate',
  TICKET_DELETE: 'ticketDelete',
  TASK_ADD: 'taskAdd',
  TASK_REMOVE_ASSIGN: 'taskRemoveAssign',
  TASK_EDIT: 'taskEdit',
  TASK_CHANGE: 'taskChange',
  TASK_DUE_DATE: 'taskDueDate',
  TASK_DELETE: 'taskDelete',
  ALL: [
    'dealAdd',
    'dealRemoveAssign',
    'dealEdit',
    'dealChange',
    'dealDueDate',
    'dealDelete',
    'purchaseAdd',
    'purchaseRemoveAssign',
    'purchaseEdit',
    'purchaseChange',
    'purchaseDueDate',
    'purchaseDelete',
    'growthHackAdd',
    'growthHackRemoveAssign',
    'growthHackEdit',
    'growthHackChange',
    'growthHackDueDate',
    'growthHackDelete',
    'ticketAdd',
    'ticketRemoveAssign',
    'ticketEdit',
    'ticketChange',
    'ticketDueDate',
    'ticketDelete',
    'taskAdd',
    'taskRemoveAssign',
    'taskEdit',
    'taskChange',
    'taskDueDate',
    'taskDelete'
  ]
};

export const ACTIVITY_CONTENT_TYPES = {
  DEAL: 'deal',
  PURCHASE: 'purchase',
  TICKET: 'ticket',
  TASK: 'task',
  PRODUCT: 'product',
  GROWTH_HACK: 'growthHack',
  CHECKLIST: 'checklist',

  ALL: [
    'deal',
    'purchase',
    'ticket',
    'task',
    'product',
    'growthHack',
    'checklist'
  ]
};

export const EXPENSE_DIVIDE_TYPES = {
  QUANTITY: 'quantity',
  AMOUNT: 'amount',
  ALL: ['quantity', 'amount']
};
