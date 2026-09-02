import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { SALES_DEAL_SEGMENT_FIELDS } from './deal';

export const SALES_SEGMENT_FIELDS: Record<string, SegmentFieldMeta[]> = {
  'sales:sales.deals': SALES_DEAL_SEGMENT_FIELDS,
};

export { SALES_DEAL_SEGMENT_FIELDS };
