import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';
import { TICKET_TYPE } from './fields';

export const TICKET_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.tickets',
    label: 'Tickets',
    subjectType: 'core:contacts.customers',
    relatedType: TICKET_TYPE,
    // Tickets keep their customer and company themselves.
    join: { via: 'field', on: 'related', path: 'customerId' },
  },
  {
    key: 'company.tickets',
    label: 'Tickets',
    subjectType: 'core:contacts.companies',
    relatedType: TICKET_TYPE,
    join: { via: 'field', on: 'related', path: 'companyId' },
  },
  {
    key: 'user.assignedTickets',
    label: 'Assigned tickets',
    subjectType: 'core:organization.users',
    relatedType: TICKET_TYPE,
    join: { via: 'field', on: 'related', path: 'assigneeId' },
  },
];
