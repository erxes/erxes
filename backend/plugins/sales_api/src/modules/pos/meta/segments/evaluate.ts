import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { posSegmentSource } from './collections';
import { POS_SEGMENT_FIELDS } from './fields';
import { POS_SEGMENT_RELATIONS } from './relations';

/**
 * What this module owns, handed to the shared evaluator.
 *
 * Orders store every value they answer with; nothing here is derived.
 */
const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => posSegmentSource(models, contentType),
  fields: POS_SEGMENT_FIELDS,
  relations: POS_SEGMENT_RELATIONS,
});

export const evaluatePosFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
