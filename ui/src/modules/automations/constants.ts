export const ACTIONS = [
  {
    type: '',
    icon: 'file-plus',
    label: 'Choose action',
    description: 'Add a new action'
  },
  {
    type: 'createTask',
    icon: 'file-plus',
    label: 'Create task',
    description: 'Add a new action'
  },
  {
    type: 'createDeal',
    icon: 'file-plus',
    label: 'Create deal',
    description: 'Add a new action'
  },
  {
    type: 'createTicket',
    icon: 'file-plus',
    label: 'Create ticket',
    description: 'Add a new action'
  },
  {
    type: 'if',
    icon: 'file-plus',
    label: 'IF',
    description: 'Add a new action'
  },
  {
    type: 'performMath',
    icon: 'file-plus',
    label: 'Perform Math',
    description: 'Add a new action'
  },
  {
    type: 'goto',
    icon: 'file-plus',
    label: 'Go to another action',
    description: 'Add a new action'
  },
  {
    type: 'wait',
    icon: 'file-plus',
    label: 'Wait for next action',
    description: 'Add a new action'
  },
  {
    type: 'sendEmail',
    icon: 'fast-mail',
    label: 'Send email',
    description: 'Send email'
  }
];

export const TRIGGERS = [
  {
    type: 'customer',
    icon: 'file-plus',
    label: 'Customer',
    description: 'Customer',
    subTriggers: [
      'customer',
      'company',
      'conversation',
      'task',
      'deal',
      'ticket'
    ]
  },
  {
    type: 'lead',
    icon: 'file-plus',
    label: 'Lead',
    description: 'Lead',
    subTriggers: ['lead', 'company', 'conversation', 'task', 'deal', 'ticket']
  },
  {
    type: 'visitor',
    icon: 'file-plus',
    label: 'Visitor',
    description: 'Visitor',
    subTriggers: [
      'visitor',
      'company',
      'conversation',
      'task',
      'deal',
      'ticket'
    ]
  },
  {
    type: 'company',
    icon: 'file-plus',
    label: 'Company',
    description: 'Company',
    subTriggers: ['company', 'customer', 'task', 'deal', 'ticket']
  },
  {
    type: 'conversation',
    icon: 'file-plus',
    label: 'Conversation',
    description: 'Conversation',
    subTriggers: [
      'conversation',
      'visitor',
      'lead',
      'customer',
      'ticket',
      'task',
      'ticket'
    ]
  },
  {
    type: 'task',
    icon: 'file-plus',
    label: 'Task',
    description: 'Task',
    subTriggers: ['task', 'customer', 'company', 'deal', 'ticket']
  },
  {
    type: 'ticket',
    icon: 'file-plus',
    label: 'Ticket',
    description: 'Ticket',
    subTriggers: ['ticket', 'customer', 'company', 'deal', 'task']
  },
  {
    type: 'deal',
    icon: 'file-plus',
    label: 'Sales pipeline',
    description: 'Deal',
    subTriggers: ['deal', 'customer', 'company', 'ticket', 'task']
  }
];
