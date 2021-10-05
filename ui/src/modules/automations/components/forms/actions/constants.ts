export const PROPERTY_TYPES = [
  {
    value: 'customer',
    label: 'Contact'
  },
  {
    value: 'company',
    label: 'Company'
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
