const PROPERTY_GROUPS = [
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
  },
  {
    label: 'Purchase pipeline',
    value: 'purchase',
    types: [
      { value: 'purchase', label: 'Purchase pipeline' },
      { value: 'product', label: 'Products & services' }
    ]
  },
  {
    label: 'Team member',
    value: 'user',
    types: [{ value: 'user', label: 'Team member' }]
  }
];

export const getPropertiesGroups = () => {
  const pluginProperties = JSON.parse(
    localStorage.getItem('plugins_properties') || '[]'
  );

  return PROPERTY_GROUPS.concat(pluginProperties);
};
