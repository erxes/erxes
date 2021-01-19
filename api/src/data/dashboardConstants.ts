export const DashboardFilterTypes = {
  User: ['modifiedBy', 'firstRespondedUser', 'assignedUser']
};

export const DashboardFilters = {
  'Customers.state': [
    { label: 'Visitor', value: 'visitor' },
    { label: 'Lead', value: 'lead' },
    { label: 'Customer', value: 'customer' }
  ],
  'Customers.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Deals.stageProbability': [
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
    { label: '10%', value: '10%' },
    { label: '20%', value: '20%' },
    { label: '30%', value: '30%' },
    { label: '40%', value: '40%' },
    { label: '50%', value: '50%' },
    { label: '60%', value: '60%' },
    { label: '70%', value: '70%' },
    { label: '80%', value: '80%' },
    { label: '90%', value: '90%' }
  ],
  'Deals.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Deals.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],
  'Conversations.status': [
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
  ]
};
