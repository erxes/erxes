import { __ } from 'modules/common/utils';

export const ACTIONS = [
  {
    type: 'if',
    icon: 'sitemap-1',
    label: __('Branches'),
    description: __('Create simple or if/then branches'),
    isAvailable: true
  },
  {
    type: 'setProperty',
    icon: 'flask',
    label: __('Manage properties'),
    description: __(
      'Update existing default or custom properties for Contacts, Companies, Cards, Conversations'
    ),
    isAvailable: true
  },
  {
    type: 'createTask',
    icon: 'file-plus-alt',
    label: __('Create task'),
    description: __('Create task'),
    isAvailable: true
  },
  {
    type: 'createDeal',
    icon: 'piggy-bank',
    label: __('Create deal'),
    description: __('Create deal'),
    isAvailable: true
  },
  {
    type: 'createTicket',
    icon: 'file-plus',
    label: __('Create ticket'),
    description: __('Create ticket'),
    isAvailable: true
  },
  {
    type: 'delay',
    icon: 'hourglass',
    label: __('Delay'),
    description: __(
      'Delay the next action with a timeframe, a specific event or activity'
    ),
    isAvailable: true
  },
  {
    type: 'customCode',
    icon: 'graduation-hat',
    label: __('Custom code'),
    description: __('Custom code'),
    isAvailable: true
  },
  {
    type: 'workflow',
    icon: 'glass-martini-alt',
    label: __('Workflow'),
    description: __(
      'Enroll in another workflow,  trigger outgoing webhook or write custom code'
    ),
    isAvailable: false
  },
  {
    type: 'externalCommunications',
    icon: 'fast-mail',
    label: __('External communications'),
    description: __('Send email, SMS or in-app messenger messages to Contacts'),
    isAvailable: false
  }
];

export const TRIGGERS = [
  {
    type: 'customer',
    img: 'automation2.svg',
    icon: 'users-alt',
    label: __('Contact'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off Contact (Customer, Lead, Visitor)'
    )
  },
  {
    type: 'company',
    img: 'automation2.svg',
    icon: 'university',
    label: __('Company'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off company'
    )
  },
  {
    type: 'conversation',
    img: 'automation4.svg',
    icon: 'chat-bubble-user',
    label: __('Conversation'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off conversation'
    )
  },
  {
    type: 'task',
    img: 'automation3.svg',
    icon: 'file-plus-alt',
    label: __('Task'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off task'
    )
  },
  {
    type: 'ticket',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: __('Ticket'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off ticket'
    )
  },
  {
    type: 'deal',
    img: 'automation3.svg',
    icon: 'piggy-bank',
    label: __('Sales pipeline'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off sales pipeline item'
    )
  },
  {
    type: 'user',
    img: 'automation4.svg',
    icon: 'users',
    label: __('Team member'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off team members'
    )
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
