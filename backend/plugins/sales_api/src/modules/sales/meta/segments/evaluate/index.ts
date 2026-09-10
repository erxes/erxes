import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SALES_SEGMENT_FIELDS } from '../fields';
import { SALES_SEGMENT_RELATIONS } from '../relations';
import { salesSegmentSource } from '../collections';
import { resolveStageDerived } from './stageDerived';
import { resolveStageDerivedNode } from './stageFilter';

const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => salesSegmentSource(models, contentType),
  fields: SALES_SEGMENT_FIELDS,
  relations: SALES_SEGMENT_RELATIONS,

  resolveDerived: ({ requests, subjectIds }) =>
    resolveStageDerived(models, requests, subjectIds),

  rewritePredicate: (node) => resolveStageDerivedNode(models, node),
});

export const evaluateSalesFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
