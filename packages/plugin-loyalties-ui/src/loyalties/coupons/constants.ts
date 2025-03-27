export const COUPON_LIST_HEADERS = [
  {
    name: 'campaignId',
    label: 'Campaign',
  },
  {
    name: 'code',
    label: 'Code',
  },
  {
    name: 'usage',
    label: 'Usage',
  },
  {
    name: 'limit',
    label: 'Limit',
  },
  {
    name: 'status',
    label: 'Status',
  },
  {
    name: 'createdAt',
    label: 'Created At',
  },
  {
    name: 'actions',
    label: ' ',
  },
];

export const FILTER_OPTIONS = {
  ownerType: [
    { label: 'Customer', value: 'customer' },
    { label: 'Company', value: 'company' },
    { label: 'Team Member', value: 'user' },
    { label: 'Unknown', value: 'unknown' },
  ],
  orderType: [{ label: 'Date', value: 'createdAt' }],
  order: [
    { label: 'Ascending', value: 1 },
    { label: 'Descending', value: -1 },
  ],
  status: [
    { label: 'New', value: 'new' },
    { label: 'In use', value: 'in_use' },
    { label: 'Done', value: 'done' },
  ],
};

export const COUPON_APPLY_TYPES = [
  { value: 'amount', label: 'Amount' },
  { value: 'percent', label: 'Percent' },
];

export const STATUS_MODE = {
  'new': 'success',
  'in_use': 'warning',
  'done': 'danger',
}