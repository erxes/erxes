import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import fetch from 'node-fetch';
import FormData from 'form-data';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue(
    'zerocodeai:analyze',
    async ({ subdomain, data: { conversation, messages } }) => {
      const models = await generateModels(subdomain);
      const config = await models.Configs.getConfig();

      let negativeCount = 0;
      let positiveCount = 0;

      for (const message of messages) {
        const body = new FormData();
        body.append('api_key', config.apiKey);
        body.append('token', config.token);
        body.append('values', message.content);

        const req = await fetch('https://zero-ai.com/inference', {
          method: 'POST',
          body
        });
        const response = await req.json();

        if (response.p.includes('positive')) {
          positiveCount++;
        }

        if (response.p.includes('negative')) {
          negativeCount++;
        }

        if (
          !(await models.Analysis.findOne({ contentTypeId: conversation._id }))
        ) {
          await models.Analysis.create({
            contentType: 'inbox:conversation',
            contentTypeId: conversation._id,
            sentiment: positiveCount > negativeCount ? 'positive' : 'negative'
          });
        }
      }
    }
  );
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};
