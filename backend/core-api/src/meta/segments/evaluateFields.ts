import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { coreSegmentOwnedSource } from './collections';
import { CORE_SEGMENT_FIELDS } from './fields';
import { CORE_SEGMENT_FIELD_NAMESPACES } from './namespaces';
import { CORE_SEGMENT_RELATIONS } from './relations';

const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => coreSegmentOwnedSource(models, contentType),
  fields: CORE_SEGMENT_FIELDS,
  namespaces: CORE_SEGMENT_FIELD_NAMESPACES,
  relations: CORE_SEGMENT_RELATIONS,
});

export const evaluateCoreFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
