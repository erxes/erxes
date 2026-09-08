import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { POS_ORDER_SEGMENT_FIELDS } from './posOrder';

/**
 * `sales:pos.orders`, matching what the event dispatcher emits.
 *
 * The module was previously declared as `sales:pos_order` against an
 * Elasticsearch index, which no write is ever named after - the same rename
 * `sales:deal` went through.
 */
export const POS_ORDER_TYPE = 'sales:pos.orders';

export const POS_SEGMENT_FIELDS: Record<string, SegmentFieldMeta[]> = {
  [POS_ORDER_TYPE]: POS_ORDER_SEGMENT_FIELDS,
};

export { POS_ORDER_SEGMENT_FIELDS };
