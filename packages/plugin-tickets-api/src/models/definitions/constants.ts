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
  TICKET: 'ticket',
  ALL: ['deal', 'ticket', 'purchase', 'task', 'growthHack'],
};

export const NOTIFICATION_TYPES = {
  TICKET_ADD: 'ticketAdd',
  TICKET_REMOVE_ASSIGN: 'ticketRemoveAssign',
  TICKET_EDIT: 'ticketEdit',
  TICKET_CHANGE: 'ticketChange',
  TICKET_DUE_DATE: 'ticketDueDate',
  TICKET_DELETE: 'ticketDelete',
  ALL: [
    'ticketAdd',
    'ticketRemoveAssign',
    'ticketEdit',
    'ticketChange',
    'ticketDueDate',
    'ticketDelete',
  ],
};

export const ACTIVITY_CONTENT_TYPES = {
  TICKET: 'ticket',
  CHECKLIST: 'checklist',

  ALL: ['ticket', 'checklist'],
};
