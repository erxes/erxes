export const JOB_TYPE_CHOISES = {
  facture: 'Facture',
  end: 'End Point',
  income: 'Income',
  move: 'Move',
  outlet: 'Outlet'
};

export const PRODUCT_CATEGORIES_STATUS = ['active', 'disabled', 'archived'];
export const PRODUCT_CATEGORIES_STATUS_FILTER = {
  disabled: 'Disabled',
  archived: 'Archived'
};

export const CONFIGS_KEY_LABELS = {
  isReqiureUOM: 'is reqiured UOM'
};

export const DURATION_TYPES = {
  hour: 'hour',
  minut: 'minut',
  day: 'day',
  month: 'month',
  all: ['minut', 'hour', 'day', 'month']
};

export const PRODUCT_CATEGORY_STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' }
];

export const menuContacts = [
  { title: 'Jobs', link: '/processes/Jobs' },
  { title: 'Flows', link: '/processes/Flows' }
];

export const menuContacts1 = [
  { title: 'Assignments', link: '/processes/performances' },
  { title: 'Works', link: '/processes/works' },
  { title: 'OverallWorks', link: '/processes/overallWorks' },
  { title: 'Performances', link: '/processes/performanceList' }
];
