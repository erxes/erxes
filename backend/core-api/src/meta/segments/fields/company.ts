import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';

export const COMPANY_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'primaryName', label: 'Primary name' }),
  SegmentField.text({ key: 'code', label: 'Code' }),
  SegmentField.text({ key: 'website', label: 'Website' }),
  SegmentField.text({ key: 'industry', label: 'Industry' }),
  SegmentField.text({ key: 'description', label: 'Description' }),
  SegmentField.text({ key: 'size', label: 'Size' }),
  SegmentField.text({ key: 'plan', label: 'Plan' }),
  SegmentField.text({ key: 'businessType', label: 'Business type' }),
  SegmentField.text({ key: 'primaryEmail', label: 'Primary email' }),
  SegmentField.text({ key: 'primaryPhone', label: 'Primary phone' }),
  SegmentField.text({ key: 'primaryAddress', label: 'Primary address' }),
  SegmentField.text({ key: 'avatar', label: 'Avatar' }),
  SegmentField.text({ key: 'parentCompanyId', label: 'Parent company' }),

  SegmentField.static({
    key: 'status',
    label: 'Status',
    options: ['Active', 'deleted'],
  }),

  SegmentField.number({ key: 'employees', label: 'Employees' }),
  SegmentField.number({ key: 'score', label: 'Score' }),

  SegmentField.boolean({ key: 'isSubscribed', label: 'Is subscribed' }),
  SegmentField.boolean({ key: 'doNotDisturb', label: 'Do not disturb' }),

  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
  SegmentField.date({ key: 'updatedAt', label: 'Modified at' }),

  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  SegmentField.lookup({
    key: 'ownerId',
    label: 'Owner',
    query: { name: 'users', labelField: 'email' },
  }),
];
