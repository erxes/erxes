import { SegmentFieldNamespace } from 'erxes-api-shared/core-modules';
import { TASK_TYPE } from './fields';

export const TASK_SEGMENT_FIELD_NAMESPACES: Record<string, SegmentFieldNamespace[]> = {
  [TASK_TYPE]: [
    {
      prefix: 'propertiesData',
      label: 'Custom properties',
      path: 'propertiesData',
      propertyType: 'operation:task',
    },
  ],
};
