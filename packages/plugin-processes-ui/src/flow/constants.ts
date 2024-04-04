export const FLOWJOBS = [
  {
    type: 'end',
    icon: 'flower',
    label: 'End Point Job',
    description: '',
    isAvailable: true
  },
  {
    type: 'job',
    icon: 'puzzle',
    label: 'Job',
    description: '',
    isAvailable: true
  },
  {
    type: 'income',
    icon: 'shoppingcart',
    label: 'Single income',
    description: '',
    isAvailable: true
  },
  {
    type: 'outlet',
    icon: 'leaf',
    label: 'Single outlet',
    description: '',
    jobReferId: '',
    isAvailable: true
  },
  {
    type: 'move',
    icon: 'exchange-alt',
    label: 'Single move',
    description: '',
    isAvailable: true
  },
  {
    type: 'flow',
    icon: 'trees',
    label: 'Sub flow',
    description: '',
    isAvailable: true
  }
];

export const FLOWJOB_TYPES = {
  ENDPOINT: 'end',
  JOB: 'job',
  INCOME: 'income',
  OUTLET: 'outlet',
  MOVE: 'move',
  FLOW: 'flow'
};

export const statusFilters = [
  { key: 'active', value: 'Active' },
  { key: 'draft', value: 'Draft' }
];
