import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';
import { DEAL_TYPE } from './collections';

export const SALES_SEGMENT_FIELD_NAMESPACES: Record<
  string,
  SegmentFieldNamespace[]
> = {
  [DEAL_TYPE]: [
    {
      prefix: 'propertiesData',
      label: 'Custom properties',
      path: 'propertiesData',
      propertyType: 'sales:deal',
    },
  ],
};
