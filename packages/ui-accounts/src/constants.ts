export const ACCOUNT_TYPE = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ALL: ['active', 'passive']
};

export const JOURNAL_TYPES = {
  MAIN: 'main',
  CASH: 'cash',
  ALL: ['main', 'cash']
};
export const IS_BALANCE = [
  { label: 'No', value: 'false' },
  { label: 'Yes', value: 'true' }
];

export const ACCOUNT_CATEGORY_STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' }
];

export const ACCOUNT_SUPPLY = [
  { label: 'Unlimited', value: 'unlimited' },
  { label: 'Limited', value: 'limited' },
  { label: 'Unique', value: 'unique' }
];

export const ACCOUNT_INFO = {
  name: 'Name',
  code: 'Code',
  categoryId: 'Category',
  type: 'Type',
  currency: 'Currency',
  isBalance: 'IsBalance',
  closePercent: 'ClosePercent',
  journal: 'Journal',
  customFieldsData: 'CustomFieldsData',
  ALL: [
    { field: 'name', label: 'Name' },
    { field: 'code', label: 'Code' },
    { field: 'categoryId', label: 'Category' },
    { field: 'type', label: 'Type' },
    { field: 'currency', label: 'Currency' },
    { field: 'isBalance', label: 'IsBalance' },
    { field: 'closePercent', label: 'ClosePercent' },
    { field: 'journal', label: 'Journal' },
    { field: 'customFieldsData', label: 'CustomFieldsData' }
  ]
};
