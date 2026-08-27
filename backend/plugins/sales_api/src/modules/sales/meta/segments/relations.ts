import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';

/**
 * Traversals into deals from the entities that own them.
 *
 * Declared once here rather than as a field on every neighbouring content
 * type: one relation makes every deal field this plugin declares reachable
 * from a customer segment, and every field added later comes along with it.
 *
 * The segment types and the record types are stated separately because they
 * are different namings of the same things - a segment calls a deal
 * `sales:sales.deals`, core's relation records call it `sales:deal`.
 */
export const SALES_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.deals',
    label: 'Deals',
    subjectType: 'core:contacts.customers',
    relatedType: 'sales:sales.deals',
    // A deal carries no customer or company ids; the link is a core relation
    // record, which core resolves and passes down with the request.
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
