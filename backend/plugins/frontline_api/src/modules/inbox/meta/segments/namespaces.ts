import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';
import { CONVERSATION_TYPE } from './fields';

export const INBOX_SEGMENT_FIELD_NAMESPACES: Record<string, SegmentFieldNamespace[]> = {
  [CONVERSATION_TYPE]: [
    {
      prefix: 'propertiesData',
      label: 'Custom properties',
      path: 'propertiesData',
      propertyType: 'frontline:conversation',
    },
  ],
};
