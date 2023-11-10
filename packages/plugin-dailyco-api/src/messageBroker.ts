import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import * as dotenv from 'dotenv';
import { serviceDiscovery } from './configs';
import { Records } from './models';
import { getDailyData, getRecordings } from './utils';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'dailyco:getDailyRoom',
    async (args): Promise<any> => {
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
        status: 'success',
        data: {
          url: `https://${domain_name}.daily.co/${roomName}?t=${token}`,
          name: roomName,
          status,
          recordingLinks: recordingLinks.map(recording => recording.url) || []
        }
      };
    }
  );
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    ...args
  });
};
