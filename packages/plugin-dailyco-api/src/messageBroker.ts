import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import * as dotenv from "dotenv";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { Records } from "./models";
import { getDailyData, getRecordings } from "./utils";

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue("dailyco:getDailyRoom", async (args): Promise<any> => {
    const { subdomain, data } = args;
    const { contentType, contentTypeId, messageId } = data;

    const callRecord = await Records.findOne({
      contentTypeId,
      contentType,
      messageId
    });

    if (!callRecord) {
      return null;
    }

    const { roomName, token, status } = callRecord;

    const { domain_name } = await getDailyData(subdomain);

    const recordingLinks = await getRecordings(
      subdomain,
      callRecord.recordings
    );

    return {
      status: "success",
      data: {
        url: `https://${domain_name}.daily.co/${roomName}?t=${token}`,
        name: roomName,
        status,
        recordingLinks: recordingLinks.map(recording => recording.url) || []
      }
    };
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: "inbox",
    ...args
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};
