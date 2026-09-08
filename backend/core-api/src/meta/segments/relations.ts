import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';

export const CORE_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'user.customers',
    label: 'Owned customers',
    subjectType: 'core:organization.users',
    relatedType: 'core:contacts.customers',
    join: { via: 'field', on: 'related', path: 'ownerId' },
  },
  {
    key: 'user.companies',
    label: 'Owned companies',
    subjectType: 'core:organization.users',
    relatedType: 'core:contacts.companies',
    join: { via: 'field', on: 'related', path: 'ownerId' },
  },
];
