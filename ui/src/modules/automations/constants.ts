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
    img: 'automation2.svg',
    icon: 'file-plus',
    label: 'Customer',
    description:
      'Start with a blank workflow that enralls and is triggered off Customer',
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
    img: 'automation1.svg',
    icon: 'file-plus',
    label: 'Lead',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
    subTriggers: ['lead', 'company', 'conversation', 'task', 'deal', 'ticket']
  },
  {
    type: 'visitor',
    img: 'automation1.svg',
    icon: 'file-plus',
    label: 'Visitor',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
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
    img: 'automation2.svg',
    icon: 'file-plus',
    label: 'Company',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
    subTriggers: ['company', 'customer', 'task', 'deal', 'ticket']
  },
  {
    type: 'conversation',
    img: 'automation4.svg',
    icon: 'file-plus',
    label: 'Conversation',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
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
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Task',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
    subTriggers: ['task', 'customer', 'company', 'deal', 'ticket']
  },
  {
    type: 'ticket',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Ticket',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
    subTriggers: ['ticket', 'customer', 'company', 'deal', 'task']
  },
  {
    type: 'deal',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Sales pipeline',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts',
    subTriggers: ['deal', 'customer', 'company', 'ticket', 'task']
  }
];
