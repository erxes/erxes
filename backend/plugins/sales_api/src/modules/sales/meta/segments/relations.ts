import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';

export const SALES_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.deals',
    label: 'Deals',
    subjectType: 'core:contacts.customers',
    relatedType: 'sales:sales.deals',
    // Deals keep their customer and company themselves.
    join: { via: 'field', on: 'related', path: 'customerId' },
  },
  {
    key: 'company.deals',
    label: 'Deals',
    subjectType: 'core:contacts.companies',
    relatedType: 'sales:sales.deals',
    join: { via: 'field', on: 'related', path: 'companyId' },
  },
];
