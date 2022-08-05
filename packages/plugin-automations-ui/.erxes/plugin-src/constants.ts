import { __ } from 'coreui/utils';

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
    type: 'cards:task.create',
    icon: 'file-plus-alt',
    label: __('Create task'),
    description: __('Create task'),
    isAvailable: true
  },
  {
    type: 'cards:deal.create',
    icon: 'piggy-bank',
    label: __('Create deal'),
    description: __('Create deal'),
    isAvailable: true
  },
  {
    type: 'cards:ticket.create',
    icon: 'file-plus',
    label: __('Create ticket'),
    description: __('Create ticket'),
    isAvailable: true
  },
  {
    type: 'loyalties:voucher.create',
    icon: 'file-plus',
    label: __('Create voucher'),
    description: __('Create voucher'),
    isAvailable: true
  },
  {
    type: 'loyalties:scoreLog.create',
    icon: 'file-plus',
    label: __('Change Score'),
    description: __('Change Score'),
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
    type: 'contacts:customer',
    img: 'automation2.svg',
    icon: 'users-alt',
    label: __('Customer'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off Customers'
    )
  },
  {
    type: 'contacts:lead',
    img: 'automation2.svg',
    icon: 'users-alt',
    label: __('Lead'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off Leads'
    )
  },
  {
    type: 'contacts:company',
    img: 'automation2.svg',
    icon: 'university',
    label: __('Company'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off company'
    )
  },
  {
    type: 'inbox:conversation',
    img: 'automation4.svg',
    icon: 'chat-bubble-user',
    label: __('Conversation'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off conversation'
    )
  },
  {
    type: 'cards:task',
    img: 'automation3.svg',
    icon: 'file-plus-alt',
    label: __('Task'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off task'
    )
  },
  {
    type: 'cards:ticket',
    img: 'automation3.svg',
    icon: 'file-plus',
    label: __('Ticket'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off ticket'
    )
  },
  {
    type: 'cards:deal',
    img: 'automation3.svg',
    icon: 'piggy-bank',
    label: __('Sales pipeline'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off sales pipeline item'
    )
  },
  {
    type: 'core:user',
    img: 'automation4.svg',
    icon: 'users',
    label: __('Team member'),
    description: __(
      'Start with a blank workflow that enralls and is triggered off team members'
    )
  }
];

export const TRIGGER_TYPES = [
  'core:user',
  'cards:deal',
  'cards:ticket',
  'cards:task',
  'inbox:conversation',
  'contacts:company',
  'contacts:customer'
];

export const statusFilters = [
  { key: 'active', value: 'Active' },
  { key: 'draft', value: 'Draft' }
];
