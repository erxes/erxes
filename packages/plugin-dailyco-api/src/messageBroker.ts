import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import * as dotenv from 'dotenv';
import { serviceDiscovery } from './configs';
import { sendDailyRequest } from './utils';
import { ICallRecord, Records } from './models';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'dailyco:createRoom',
    async (args): Promise<any> => {
      const {
        subdomain,
        erxesApiConversationId,
        contentType = 'inbox:conversations'
      } = args;

      try {
        const response = await sendDailyRequest(
          '/api/v1/rooms',
          'post',
          { privacy: 'private' },
          subdomain
        );

        const tokenResponse = await sendDailyRequest(
          '/api/v1/meeting-tokens',
          'post',
          {
            properties: { room_name: response.name, enable_recording: 'cloud' }
          },
          subdomain
        );

        const doc: ICallRecord = {
          contentTypeId: erxesApiConversationId,
          contentType,
          roomName: response.name,
          privacy: response.privacy,
          token: tokenResponse.token,
          status: 'ongoing'
        };

        const record = await Records.createCallRecord(doc);

        const domain_name = response.domain_name;

        return {
          status: 'success',
          data: {
            url: `${domain_name}/${record.roomName}?=t${record.token}`,
            name: record.roomName,
            status: 'ongoing'
          }
        };
      } catch (e) {
        console.log(e);
        return {
          status: 'failed',
          message: e.message
        };
      }
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
