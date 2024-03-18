export const VISIBLITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ALL: ['public', 'private'],
};

export const HACK_SCORING_TYPES = {
  RICE: 'rice',
  ICE: 'ice',
  PIE: 'pie',
  ALL: ['rice', 'ice', 'pie'],
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
    'Resolved',
  ],
};

export const BOARD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

export const BOARD_STATUSES_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
];

export const TIME_TRACK_TYPES = {
  STARTED: 'started',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ALL: ['started', 'stopped', 'paused', 'completed'],
};

export const BOARD_TYPES = {
  GROWTH_HACK: 'growthHack',
  ALL: ['growthHack'],
};

export const NOTIFICATION_TYPES = {
  GROWTHHACK_ADD: 'growthHackAdd',
  GROWTHHACK_REMOVE_ASSIGN: 'growthHackRemoveAssign',
  GROWTHHACK_EDIT: 'growthHackEdit',
  GROWTHHACK_CHANGE: 'growthHackChange',
  GROWTHHACK_DUE_DATE: 'growthHackDueDate',
  GROWTHHACK_DELETE: 'growthHackDelete',
  ALL: [
    'growthHackAdd',
    'growthHackRemoveAssign',
    'growthHackEdit',
    'growthHackChange',
    'growthHackDueDate',
    'growthHackDelete',
  ],
};

export const ACTIVITY_CONTENT_TYPES = {
  PRODUCT: 'product',
  GROWTH_HACK: 'growthHack',
  CHECKLIST: 'checklist',

  ALL: ['product', 'growthHack', 'checklist'],
};

export const EXPENSE_DIVIDE_TYPES = {
  QUANTITY: 'quantity',
  AMOUNT: 'amount',
  ALL: ['quantity', 'amount'],
};
