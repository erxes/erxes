import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';
import { POS_ORDER_TYPE } from './fields';

/**
 * Traversals into orders from the contacts that placed them.
 *
 * An order names its buyer, unlike a deal, so this is a plain field join and
 * needs no relation record. `pos_orders.customerId` is indexed for it.
 */
export const POS_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.posOrders',
    label: 'POS orders',
    subjectType: 'core:contacts.customers',
    relatedType: POS_ORDER_TYPE,
    join: { via: 'field', on: 'related', path: 'customerId' },
  },
];
