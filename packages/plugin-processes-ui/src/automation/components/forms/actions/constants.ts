export const PROPERTY_TYPES = [
  {
    value: 'contacts:customer',
    label: 'Contact'
  },
  {
    value: 'contacts:company',
    label: 'Company'
  },
  {
    value: 'cards:deal',
    label: 'Deal'
  },
  {
    value: 'cards:task',
    label: 'Task'
  },
  {
    value: 'cards:ticket',
    label: 'Ticket'
  },
  {
    value: 'inbox:conversation',
    label: 'Conversation'
  },
  {
    value: 'core:user',
    label: 'Team Member'
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

export const PROPERTY_OPERATOR = {
  String: [
    {
      value: 'set',
      label: 'Set'
    },
    {
      value: 'concat',
      label: 'Concat'
    }
  ],
  Date: [
    {
      value: 'set',
      label: 'Set'
    },
    {
      value: 'addDay',
      label: 'Add Day'
    },
    {
      value: 'subtractDay',
      label: 'Subtract Day'
    }
  ],
  Number: [
    {
      value: 'add',
      label: 'Add'
    },
    {
      value: 'subtract',
      label: 'subtract'
    },
    {
      value: 'multiply',
      label: 'Multiply'
    },
    {
      value: 'divide',
      label: 'Divide'
    }
  ],
  Default: [
    {
      value: 'set',
      label: 'Set'
    }
  ]
};
