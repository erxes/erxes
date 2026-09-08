import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { taskSegmentSource } from './collections';
import { TASK_SEGMENT_FIELD_MAP } from './fields';
import { TASK_SEGMENT_RELATIONS } from './relations';

const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => taskSegmentSource(models, contentType),
  fields: TASK_SEGMENT_FIELD_MAP,
  relations: TASK_SEGMENT_RELATIONS,
});

export const evaluateTaskFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
