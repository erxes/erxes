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

export const automationSegmentGateway = (
  subdomain: string,
): SegmentEvaluationGateway => ({
  relationsFor: gatherSegmentRelations,

  timeZone: () => segmentTimeZone(subdomain),

  resolveFields: async (pluginName, input) => {
    const answer: SegmentEvaluateFieldsResult | undefined =
      await sendCoreModuleProducer({
        subdomain,
        moduleName: 'segments',
        pluginName,
        producerName: TSegmentProducers.EVALUATE_FIELDS,
        method: 'query',
        input,
      });

    if (!answer?.values) {
      throw new Error(`Plugin "${pluginName}" did not answer segment fields`);
    }

    return answer;
  },

  resolveEdges: async ({
    subjectRecordType,
    relatedRecordType,
    subjectIds,
  }) => {
    const edges: Record<string, string[]> | undefined = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'segment',
      action: 'relationEdges',
      input: {
        subjectType: subjectRecordType,
        relatedType: relatedRecordType,
        subjectIds,
      },
    });

    if (!edges) {
      throw new Error(
        `Core did not answer relation edges for "${subjectRecordType}"`,
      );
    }

    return edges;
  },
});
