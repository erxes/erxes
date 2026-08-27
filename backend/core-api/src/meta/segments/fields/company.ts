import {
  booleanField,
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';

/** Filterable fields for `core:company`. */
export const COMPANY_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'primaryName', label: 'Primary name' }),
  textField({ key: 'code', label: 'Code' }),
  textField({ key: 'website', label: 'Website' }),
  textField({ key: 'industry', label: 'Industry' }),
  textField({ key: 'description', label: 'Description' }),
  textField({ key: 'size', label: 'Size' }),
  textField({ key: 'plan', label: 'Plan' }),
  textField({ key: 'businessType', label: 'Business type' }),
  textField({ key: 'primaryEmail', label: 'Primary email' }),
  textField({ key: 'primaryPhone', label: 'Primary phone' }),
  textField({ key: 'primaryAddress', label: 'Primary address' }),
  textField({ key: 'avatar', label: 'Avatar' }),
  textField({ key: 'parentCompanyId', label: 'Parent company' }),

  staticField({
    key: 'status',
    label: 'Status',
    options: ['Active', 'deleted'],
  }),

  numberField({ key: 'employees', label: 'Employees' }),
  numberField({ key: 'score', label: 'Score' }),

  booleanField({ key: 'isSubscribed', label: 'Is subscribed' }),
  booleanField({ key: 'doNotDisturb', label: 'Do not disturb' }),

  dateField({ key: 'createdAt', label: 'Created at' }),
  dateField({ key: 'updatedAt', label: 'Modified at' }),

  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  lookupField({
    key: 'ownerId',
    label: 'Owner',
    query: { name: 'users', labelField: 'email' },
  }),
];
