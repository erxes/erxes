import {
  gatherSegmentRelations,
  SegmentEvaluateFieldsResult,
  SegmentEvaluationGateway,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

/**
 * How the segmentation worker reaches the participants.
 *
 * Nothing here touches a database. Every plugin - core included - answers for
 * its own records through its published producer, and the relation table is
 * read through core's contract rather than its collection. That is what lets
 * this run outside the services that own the data.
 */
export const workerSegmentGateway = (
  subdomain: string,
): SegmentEvaluationGateway => ({
  relationsFor: gatherSegmentRelations,

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
