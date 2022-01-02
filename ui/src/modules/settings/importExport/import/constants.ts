export const BOARD_ITEM_EXTENDED_FIELDS = [
  {
    value: 'boardName',
    label: 'Board name',
    type: 'string'
  },
  {
    value: 'pipelineName',
    label: 'Pipeline name',
    type: 'string'
  },
  {
    value: 'stageName',
    label: 'Stage name',
    type: 'string'
  },
  {
    value: 'assignedUserEmail',
    label: 'Assigned user email',
    type: 'string'
  }
];

export const renderText = value => {
  switch (value) {
    case 'customer':
      return 'Customers';
    case 'company':
      return 'Companies';
    case 'deal':
      return 'Deals';
    case 'ticket':
      return 'Tickets';
    case 'task':
      return 'Tasks';
    case 'lead':
      return 'Leads';
    default:
      return value;
  }
};
