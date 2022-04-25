import * as dotenv from "dotenv";
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { isAvailable } from "./redis";
import {
  ISendMessageArgs,
  sendMessage
} from "@erxes/api-utils/src/core";
import { serviceDiscovery } from './redis'

dotenv.config();

let client;

export const initBroker = async (options) => {
  client = await initBrokerCore(options);

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    "gateway:isServiceAvailable",
    async (names) => {
      return {
        status: "success",
        data: names.includes(',') ? await Promise.all(names.split(',').map((name) => isAvailable(name))) : await isAvailable(names),
      }
    }
  );
};

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendMessage({ client, serviceDiscovery, serviceName: "contacts", ...args })
}

export const sendCoreMessage = (args: ISendMessageArgs) => {
  return sendMessage({ client, serviceDiscovery, serviceName: "core", ...args })
}

export default function() {
  return client;
}