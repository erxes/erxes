export const PERFORM_STATUSES = {
  '': 'All',
  confirmed: 'Confirmed',
  draft: 'Draft'
};

export const JOB_TYPE_CHOISES = {
  job: 'Facture',
  end: 'End Point',
  income: 'Income',
  move: 'Move',
  outlet: 'Outlet'
};

export const PRODUCT_CATEGORIES_STATUS_FILTER = {
  disabled: 'Disabled',
  archived: 'Archived'
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

export const menuSettings = [
  { title: 'Jobs', link: '/processes/Jobs' },
  { title: 'Flows', link: '/processes/Flows' }
];

export const menuNavs = [
  { title: 'Overall Works', link: '/processes/overallWorks' },
  { title: 'Overall Work Detail', link: '/processes/overallWorkDetail' },
  { title: 'Works', link: '/processes/works' },
  { title: 'Performances', link: '/processes/performanceList' }
];
