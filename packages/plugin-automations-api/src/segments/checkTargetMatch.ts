import { debugError } from "@erxes/api-utils/src/debuggers";
import { getService } from "@erxes/api-utils/src/serviceDiscovery";
import { sendCommonMessage, sendSegmentsMessage } from "../messageBroker";
import { compileSegmentToMongoSelector } from "./compiler";
import { TSegment } from "./types";

const splitContentType = (contentType: string) => {
  const [serviceName, collectionType] = contentType.split(":");

  return { serviceName, collectionType };
};

const hasCheckTargetMatchConfigured = async (triggerType: string) => {
  const [serviceName] = triggerType.split(":");
  const service = await getService(serviceName);
  const automationsMeta = (service.config.meta || {}).automations || {};
  const triggers = automationsMeta?.constants?.triggers || [];

  const trigger = triggers.find((t: any) => t.type === triggerType);

  if (!trigger) {
    return false;
  }

  if (trigger.checkTargetMatch) {
    return true;
  }

  return false;
};

export const checkTargetMatchBySegment = async ({
  subdomain,
  segmentId,
  targetId,
  triggerType
}: {
  subdomain: string;
  segmentId: string;
  targetId: string;
  triggerType: string;
}): Promise<boolean | null> => {
  const segmentCache = new Map<string, TSegment | null>();

  const loadSegment = async (id: string) => {
    if (segmentCache.has(id)) {
      return segmentCache.get(id) || null;
    }

    const segment = await sendSegmentsMessage({
      subdomain,
      action: "segmentFindOne",
      data: { _id: id },
      isRPC: true,
      defaultValue: null
    });

    segmentCache.set(id, segment);

    return segment;
  };

  const segment = await loadSegment(segmentId);

  if (!segment) {
    return null;
  }

  const compiled = await compileSegmentToMongoSelector({
    segment,
    loadSegment
  });

  if (!compiled.ok) {
    return null;
  }

  const { serviceName, collectionType } = splitContentType(segment.contentType);

  if (!serviceName || !collectionType) {
    return null;
  }

  const canCheckTargetMatch = await hasCheckTargetMatchConfigured(triggerType);

  if (!canCheckTargetMatch) {
    return null;
  }

  try {
    const response = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "automations.checkTargetMatch",
      data: {
        moduleName: "automations",
        contentType: segment.contentType,
        collectionType,
        targetId,
        selector: compiled.selector
      },
      isRPC: true,
      defaultValue: null
    });
    return typeof response === "boolean" ? response : null;
  } catch (error) {
    debugError(error?.message || "Error while checking target match");
    return null;
  }
};
