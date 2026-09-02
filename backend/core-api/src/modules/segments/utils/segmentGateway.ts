import {
  gatherSegmentRelations,
  SegmentEvaluateFieldsResult,
  SegmentEvaluationGateway,
  segmentTimeZone,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { evaluateCoreFields } from '~/meta/segments/evaluateFields';
import { relationEdgesFor } from './relationEdges';

export const coreSegmentGateway = (
  models: IModels,
  subdomain: string,
): SegmentEvaluationGateway => ({
  relationsFor: gatherSegmentRelations,

  timeZone: () => segmentTimeZone(subdomain),

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
