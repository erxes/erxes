import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { ticketSegmentSource } from './collections';
import { FRONTLINE_SEGMENT_FIELDS } from './fields';
import { TICKET_SEGMENT_RELATIONS } from './relations';

const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => ticketSegmentSource(models, contentType),
  fields: FRONTLINE_SEGMENT_FIELDS,
  relations: TICKET_SEGMENT_RELATIONS,
});

export const evaluateTicketFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
