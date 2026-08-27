import {
  gatherSegmentRelations,
  SegmentEvaluateFieldsResult,
  SegmentEvaluationGateway,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { evaluateCoreFields } from '~/meta/segments/evaluateFields';
import { relationEdgesFor } from './relationEdges';

/**
 * How core reaches the participants when it runs a segment itself.
 *
 * Core answers for its own records and reads its own relation table without
 * leaving the process; a round trip through the gateway to reach ourselves
 * would only add latency to a preview the user is waiting on. Everyone else is
 * a producer call, exactly as it is for any other caller of the engine.
 */
export const coreSegmentGateway = (
  models: IModels,
  subdomain: string,
): SegmentEvaluationGateway => ({
  relationsFor: gatherSegmentRelations,

  resolveFields: async (pluginName, input) =>
    pluginName === 'core'
      ? evaluateCoreFields(models, input)
      : sendCoreModuleProducer({
          subdomain,
          moduleName: 'segments',
          pluginName,
          producerName: TSegmentProducers.EVALUATE_FIELDS,
          method: 'query',
          input,
          defaultValue: { values: {} } as SegmentEvaluateFieldsResult,
        }),

  resolveEdges: async ({ subjectRecordType, relatedRecordType, subjectIds }) =>
    relationEdgesFor(models, {
      subjectType: subjectRecordType,
      relatedType: relatedRecordType,
      subjectIds,
    }),
});
