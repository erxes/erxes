import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';
import { TICKET_TYPE } from './fields';

export const TICKET_SEGMENT_FIELD_NAMESPACES: Record<string, SegmentFieldNamespace[]> = {
  [TICKET_TYPE]: [
    {
      prefix: 'propertiesData',
      label: 'Custom properties',
      path: 'propertiesData',
      propertyType: 'frontline:ticket',
    },
  ],
};
