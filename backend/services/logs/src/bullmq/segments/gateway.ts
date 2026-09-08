import {
  gatherSegmentRelations,
  SegmentEvaluateFieldsResult,
  SegmentEvaluationGateway,
  segmentTimeZone,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

export const workerSegmentGateway = (
  subdomain: string,
): SegmentEvaluationGateway => ({
  relationsFor: gatherSegmentRelations,

  timeZone: () => segmentTimeZone(subdomain),

  resolveFields: async (pluginName, input) =>
    sendCoreModuleProducer({
      subdomain,
      moduleName: 'segments',
      pluginName,
      producerName: TSegmentProducers.EVALUATE_FIELDS,
      method: 'query',
      input,
      defaultValue: { values: {} } as SegmentEvaluateFieldsResult,
    }),

  resolveEdges: async ({ subjectRecordType, relatedRecordType, subjectIds }) =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'relationEdges',
      input: {
        subjectType: subjectRecordType,
        relatedType: relatedRecordType,
        subjectIds,
      },
      defaultValue: {},
    }),
});
