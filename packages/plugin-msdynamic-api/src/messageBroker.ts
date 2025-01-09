import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import { IContext as IMainContext } from "@erxes/api-utils/src";

import { IModels } from "./connectionResolver";
import { afterMutationHandlers } from "./afterMutations";
import { consumeQueue } from "@erxes/api-utils/src/messageBroker";

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const setupMessageConsumers = async () => {
  consumeQueue("msdynamic:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });
};

export const sendPosMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "pos",
    ...args
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInventoriesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'inventories',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args
  });
};
