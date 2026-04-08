import { splitType, TAutomationProducers } from 'erxes-api-shared/core-modules';
import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import {
  compileSegmentToMongoSelector,
  hasSingleSegmentContentType,
} from './segmentMongoMatcher';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const canUseCoreFastPath = (contentType: string) => {
  const [, moduleName, collectionType] = splitType(contentType);

  if (moduleName === 'organization' && collectionType === 'users') {
    return true;
  }

  if (
    moduleName === 'contacts' &&
    ['customers', 'leads', 'companies'].includes(collectionType)
  ) {
    return true;
  }

  return false;
};

export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string,
  delayMs: number = 15000,
) => {
  const segmentCache = new Map<string, any>();

  const loadSegment = async (id: string) => {
    if (segmentCache.has(id)) {
      return segmentCache.get(id);
    }

    const loadedSegment = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'segment',
      action: 'findOne',
      input: { _id: id },
      defaultValue: null,
    });

    segmentCache.set(id, loadedSegment);

    return loadedSegment;
  };

  const segment = await loadSegment(segmentId);

  if (!segment) {
    return false;
  }

  const canUseFastPath =
    Boolean(segment.contentType) &&
    canUseCoreFastPath(segment.contentType) &&
    (await hasSingleSegmentContentType({
      segment,
      loadSegment,
    }));

  if (canUseFastPath) {
    const selector = await compileSegmentToMongoSelector({
      segment,
      loadSegment,
    });

    if (selector) {
      const [pluginName, moduleName, collectionType] = splitType(
        segment.contentType,
      );

      return await sendCoreModuleProducer({
        moduleName: 'automations',
        subdomain,
        pluginName,
        producerName: TAutomationProducers.CHECK_TARGET_MATCH,
        input: {
          moduleName,
          contentType: segment.contentType,
          collectionType,
          targetId,
          selector,
        },
        defaultValue: false,
      });
    }
  }

  await delay(delayMs);

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'segment',
    action: 'isInSegment',
    input: { segmentId, idToCheck: targetId },
    defaultValue: false,
  });
};
