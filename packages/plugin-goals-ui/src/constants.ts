export const PRODUCT_CATEGORIES_STATUS = ['active', 'disabled', 'archived'];
export const PRODUCT_CATEGORIES_STATUS_FILTER = {
  disabled: 'Disabled',
  archived: 'Archived',
  deleted: 'Deleted'
};
export const PRODUCT_TYPE_CHOISES = {
  product: 'Product',
  service: 'Service',
  unique: 'Unique'
};

export const ENTITY = [
  { name: 'Deal Based Goal', value: 'deal' },
  { name: 'Task Based Goal', value: 'task' },
  { name: 'Ticket Based Goal', value: 'ticket' },
  { name: 'Purchase Based Goal', value: 'purchase' }
];
export const GOAL_STRUCTURE = [
  { name: 'Branches', value: 'Branches' },
  { name: 'Departments', value: 'Departments' },
  { name: 'Units', value: 'Units' }
];
export const SPECIFIC_PERIOD_GOAL = [
  {
    name: 'Weekly',
    value: 'Weekly'
  },
  { name: 'Monthly', value: 'Monthly' }
];

export const viewModes = [
  { label: 'List View', type: 'list', icon: 'list-ui-alt' },
  { label: 'Board View', type: 'board', icon: 'postcard' },
  { label: 'Calendar view', type: 'calendar', icon: 'postcard' }
];

// export const ENTITY = ['deal', 'task', 'ticket', 'purchase'];
// export const CONTRIBUTION = ['Team Goal', 'Personal Goal'];

export const CONTRIBUTION = [
  { name: 'Team Goal', value: 'team' },
  { name: 'Personal Goal', value: 'person' }
];

export const FREQUENCY = ['Weekly', 'Monthly', ' Quarterly', 'Yearly'];

export const GOAL_TYPE = [
  'Added',
  'Processed',
  'Won (Deal based only)',
  'Meetings held (meeting based only)'
];
