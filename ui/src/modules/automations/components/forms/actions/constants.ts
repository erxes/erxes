export const PROPERTY_TYPES = [
  {
    value: 'company',
    label: 'Company'
  },
  {
    value: 'customer',
    label: 'Customer'
  },
  {
    value: 'deal',
    label: 'Deal'
  },
  {
    value: 'task',
    label: 'Task'
  },
  {
    value: 'ticket',
    label: 'Ticket'
  },
  {
    value: 'conversation',
    label: 'Conversation'
  }
];

export const PROPERTY_FIELD = [
  {
    value: 'size',
    label: 'Size'
  },
  {
    value: 'amount',
    label: 'Amount'
  },
  {
    value: 'state',
    label: 'State'
  }
];

export const PROPERTY_OPERATOR = [
  {
    value: 'set',
    label: 'Set'
  },
  {
    value: 'add',
    label: 'Add'
  },
  {
    value: 'subtract',
    label: 'Subtract'
  }
];

export const ATTRIBUTIONS = {
  'Associated Contact': [
    {
      value: 'firstName',
      label: 'First Name'
    },
    {
      value: 'lastName',
      label: 'Last Name'
    },
    {
      value: 'email',
      label: 'Email'
    }
  ],
  'Associated Deal/Ticket/Task': [
    {
      value: 'name',
      label: 'Name'
    },
    {
      value: 'createdAt',
      label: 'Created date'
    },
    {
      value: 'closeDate',
      label: 'Close date'
    },
    {
      value: 'modifiedAt',
      label: 'Modified date'
    },
    {
      value: 'priority',
      label: 'Priority'
    },
    {
      value: 'status',
      label: 'Status'
    }
  ]
};
