import {
  evaluateOwnedSegmentFields,
  SegmentEvaluateFieldsResult,
  SegmentOwnerContract,
  SegmentValueRequest,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { inboxSegmentSource } from './collections';
import { resolveIntegrationKind, resolveIntegrationKindNode } from './derived';
import { INBOX_SEGMENT_FIELDS } from './fields';
import { INBOX_SEGMENT_RELATIONS } from './relations';

/**
 * What this module owns, handed to the shared evaluator.
 *
 * Only two things here are the inbox's own: the channel a conversation
 * arrived through, which lives on the integration rather than the
 * conversation, and the rewrite that lets a condition on it be compiled.
 */
const contract = (models: IModels): SegmentOwnerContract => ({
  sourceFor: (contentType) => inboxSegmentSource(models, contentType),
  fields: INBOX_SEGMENT_FIELDS,
  relations: INBOX_SEGMENT_RELATIONS,

  resolveDerived: ({ requests, subjectIds }) =>
    resolveIntegrationKind(models, requests, subjectIds),

  rewritePredicate: (node) => resolveIntegrationKindNode(models, node),
});

export const evaluateInboxFields = async (
  models: IModels,
  data: {
    subjectType: string;
    subjectIds: string[];
    requests: SegmentValueRequest[];
    timeZone?: string;
  },
): Promise<SegmentEvaluateFieldsResult> =>
  evaluateOwnedSegmentFields(contract(models), data);
