import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';

export const SALES_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.deals',
    label: 'Deals',
    subjectType: 'core:contacts.customers',
    relatedType: 'sales:sales.deals',
    join: {
      via: 'relation',
      subjectRecordType: 'core:customer',
      relatedRecordType: 'sales:deal',
    },
  },
  {
    key: 'company.deals',
    label: 'Deals',
    subjectType: 'core:contacts.companies',
    relatedType: 'sales:sales.deals',
    join: {
      via: 'relation',
      subjectRecordType: 'core:company',
      relatedRecordType: 'sales:deal',
    },
  },
];
