export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  PRODUCT: 'product',
  CONVERSATION: 'conversation',
  DEVICE: 'device',
  ALL: ['customer', 'company', 'product', 'conversation', 'device']
};

export const PROPERTY_GROUPS = [
  {
    label: 'Contacts',
    value: 'contact',
    types: [
      { value: 'customer', label: 'Customers' },
      { value: 'company', label: 'Companies' },
      { value: 'conversation', label: 'Conversation details' },
      { value: 'device', label: 'Device properties' }
    ]
  },
  {
    label: 'Tickets',
    value: 'ticket',
    types: [{ value: 'ticket', label: 'Tickets' }]
  },
  { label: 'Tasks', value: 'task', types: [{ value: 'task', label: 'Tasks' }] },
  {
    label: 'Sales pipeline',
    value: 'deal',
    types: [
      { value: 'deal', label: 'Sales pipeline' },
      { value: 'product', label: 'Products & services' }
    ]
  }
];
