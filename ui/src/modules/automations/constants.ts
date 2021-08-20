export const ACTIONS = [
  {
    type: 'if',
    icon: 'share-alt',
    label: 'Branches',
    description: 'Create simple or if/then branches',
    isAvailable: true
  },
  {
    type: 'setProperty',
    icon: 'calcualtor',
    label: 'Manage properies',
    description:
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations',
    isAvailable: true
  },
  {
    type: 'createRecord',
    icon: 'file-plus-alt',
    label: 'Create new record',
    description: 'Create new Task, Ticket, Deal cards',
    isAvailable: true
  },
  {
    type: 'createTask',
    icon: 'file-plus-alt',
    label: 'Create task',
    description: 'Add a new action',
    isAvailable: true
  },
  {
    type: 'createDeal',
    icon: 'piggy-bank',
    label: 'Create deal',
    description: 'Add a new action',
    isAvailable: true
  },
  {
    type: 'createTicket',
    icon: 'file-plus',
    label: 'Create ticket',
    description: 'Add a new action',
    isAvailable: true
  },
  {
    type: 'delay',
    icon: 'arrows-up-right',
    label: 'Delay',
    description:
      'Delay the next action with a timeframe, a specific event or activity',
    isAvailable: false
  },
  {
    type: 'workflow',
    icon: 'hourglass',
    label: 'Workflow',
    description:
      'Enroll in another workflow,  trigger outgoing webhook or write custom code',
    isAvailable: false
  },
  {
    type: 'manageTags',
    icon: 'tag',
    label: 'Manage Tags',
    description:
      'Tag associated Contacts, Companies, or Team Inbox conversations',
    isAvailable: false
  },
  {
    type: 'externalCommunications',
    icon: 'fast-mail',
    label: 'External communications',
    description: 'Send email, SMS or in-app messenger messages to Contacts',
    isAvailable: false
  }
];

export const TRIGGERS = [
  {
    type: 'customer',
    img: 'automation2.svg',
    icon: 'file-plus',
    label: 'Customer',
    description:
      'Start with a blank workflow that enralls and is triggered off Customer'
  },
  {
    type: 'lead',
    img: 'automation1.svg',
    icon: 'file-plus',
    label: 'Lead',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'visitor',
    img: 'automation1.svg',
    icon: 'file-plus',
    label: 'Visitor',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'company',
    img: 'automation2.svg',
    icon: 'file-plus',
    label: 'Company',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'conversation',
    img: 'automation4.svg',
    icon: 'file-plus',
    label: 'Conversation',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'task',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Task',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'ticket',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Ticket',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  },
  {
    type: 'deal',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Sales pipeline',
    description:
      'Start with a blank workflow that enralls and is triggered off contacts'
  }
];

export const ENROLLS = [
  {
    id: 1,
    label: 'Deal is manually enrolled'
  },
  {
    id: 2,
    label: 'Amount is greater than or equal to $59'
  },
  {
    id: 3,
    label: 'Closed won reason is know'
  },
  {
    id: 4,
    label: 'Deal stage is any of Qualified to buy'
  }
];
