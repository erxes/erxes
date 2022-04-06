import { generateModels } from "./connectionResolver";
import { ISendMessageArgs, sendMessage } from "@erxes/api-utils/src/core";
import { serviceDiscovery } from "./configs";

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;
};

export const sendPosMessage = async (
  models,
  messageBroker,
  channel,
  params,
  pos = undefined,
  excludeTokens = [] as any
) => {
  const allPos = pos ? [pos] : await models.Pos.find().lean();

  for (const p of allPos) {
    if (excludeTokens.includes(p.token)) {
      continue;
    }

    const syncIds = Object.keys(p.syncInfos || {}) || [];

    if (!syncIds.length) {
      continue;
    }

    for (const syncId of syncIds) {
      const syncDate = p.syncInfos[syncId];

      // expired sync 72 hour
      if ((new Date().getTime() - syncDate.getTime()) / (60 * 60 * 1000) > 72) {
        continue;
      }

      messageBroker().sendMessage(`${channel}_${syncId}`, params);
    }
  }
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: "core",
    ...args,
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args,
  });
};

export default function() {
  return client;
}
