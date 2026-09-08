import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { TICKET_SEGMENT_FIELDS } from './ticket';

export const TICKET_TYPE = 'frontline:tickets.tickets';

/** Every content type this module owns, and what a segment may filter it by. */
export const FRONTLINE_SEGMENT_FIELDS: Record<string, SegmentFieldMeta[]> = {
  [TICKET_TYPE]: TICKET_SEGMENT_FIELDS,
};

export { TICKET_SEGMENT_FIELDS };
