import { sendTRPCMessage } from 'erxes-api-shared/utils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string,
  delayMs: number = 15000,
) => {
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
