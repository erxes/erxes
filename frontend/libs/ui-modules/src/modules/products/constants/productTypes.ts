export const PRODUCT_TYPES = [
  { label: 'Product', value: 'product' },
  { label: 'Service', value: 'service' },
  { label: 'Unique', value: 'unique' },
  { label: 'Subscription', value: 'subscription' },
];

export const PRODUCT_DURATION_TYPES = [
  { label: 'Minute', value: 'minute' },
  { label: 'Hour', value: 'hour' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
] as const;

export const PRODUCT_DURATION_TYPE_VALUES = [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
] as const;
