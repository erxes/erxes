import {
  SegmentEvaluateFieldsResult,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { evaluateDealFields } from './deal';

/**
 * Entry point for the refs a segment plan assigns to this module.
 *
 * Deals are the only content type this module declares, so everything lands on
 * one resolver. It is not gated on the subject type: a relation into deals is
 * measured for whatever subject owns it, and `evaluateDealFields` already
 * separates a field it can read from one that needs a relation to reach.
 */
export const evaluateSalesFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
  },
): Promise<SegmentEvaluateFieldsResult> => evaluateDealFields(models, data);
