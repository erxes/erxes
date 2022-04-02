import * as dotenv from "dotenv";
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { isAvailable } from "./redis";

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

export const sendSchedularMessage = () => {
  return client.sendMessage('schedular', 'install');
}

export default function() {
  return client;
}