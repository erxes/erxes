export const ACTIONS = [
  {
    type: 'if',
    icon: 'sitemap-1',
    label: 'Branches',
    description: 'Create simple or if/then branches',
    isAvailable: true
  },
  {
    type: 'setProperty',
    icon: 'calcualtor',
    label: 'Manage properties',
    description:
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations',
    isAvailable: true
  },
  {
    type: 'createTask',
    icon: 'file-plus-alt',
    label: 'Create task',
    description: 'Create task',
    isAvailable: true
  },
  {
    type: 'createDeal',
    icon: 'piggy-bank',
    label: 'Create deal',
    description: 'Create deal',
    isAvailable: true
  },
  {
    type: 'createTicket',
    icon: 'file-plus',
    label: 'Create ticket',
    description: 'Create ticket',
    isAvailable: true
  },
  {
    type: 'delay',
    icon: 'arrows-up-right',
    label: 'Delay',
    description:
      'Delay the next action with a timeframe, a specific event or activity',
    isAvailable: true
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
    label: 'Contact',
    description:
      'Start with a blank workflow that enralls and is triggered off Contact (Customer, Lead, Visitor)'
  },
  {
    type: 'company',
    img: 'automation2.svg',
    icon: 'file-plus',
    label: 'Company',
    description:
      'Start with a blank workflow that enralls and is triggered off company'
  },
  {
    type: 'conversation',
    img: 'automation4.svg',
    icon: 'file-plus',
    label: 'Conversation',
    description:
      'Start with a blank workflow that enralls and is triggered off conversation'
  },
  {
    type: 'task',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Task',
    description:
      'Start with a blank workflow that enralls and is triggered off task'
  },
  {
    type: 'ticket',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Ticket',
    description:
      'Start with a blank workflow that enralls and is triggered off ticket'
  },
  {
    type: 'deal',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: 'Sales pipeline',
    description:
      'Start with a blank workflow that enralls and is triggered off sales pipeline item'
  },
  {
    type: 'user',
    img: 'automation4.svg',
    icon: 'file-plus',
    label: 'Team member',
    description:
      'Start with a blank workflow that enralls and is triggered off team members'
  }
];

export const TRIGGER_TYPES = [
  'user',
  'deal',
  'ticket',
  'task',
  'conversation',
  'company',
  'customer'
];

export const statusFilters = [
  { key: 'active', value: 'Active' },
  { key: 'draft', value: 'Draft' }
];
