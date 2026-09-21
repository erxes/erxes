import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { TASK_SEGMENT_FIELDS } from './task';

/** As the event dispatcher names it: `operationEventHandlers('task','tasks')`. */
export const TASK_TYPE = 'operation:task.tasks';

/** Every content type this module owns, and what a segment may filter it by. */
export const TASK_SEGMENT_FIELD_MAP: Record<string, SegmentFieldMeta[]> = {
  [TASK_TYPE]: TASK_SEGMENT_FIELDS,
};

export { TASK_SEGMENT_FIELDS };
