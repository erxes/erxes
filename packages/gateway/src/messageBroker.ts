import * as dotenv from "dotenv";
import messageBroker from "erxes-message-broker";
import { isAvailable } from "./redis";

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: "gateway",
    server,
    envs: process.env,
  });

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

export default function() {
  return client;
}