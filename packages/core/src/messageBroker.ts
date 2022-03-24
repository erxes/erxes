import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

import { logConsumers } from '@erxes/api-utils/src/logUtils';
import { internalNoteConsumers } from '@erxes/api-utils/src/internalNotes';
import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import { Conformities, Configs, Users, Brands, EmailDeliveries } from './db/models';
import { registerModule } from './data/permissions/utils';
import {
  getConfig,
  getFileUploadConfigs,
  sendEmail,
  sendMobileNotification
} from './data/utils';

import logUtils from './logUtils';
import internalNotes from './internalNotes';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  // do not receive messages in crons worker
  if (!['crons', 'workers'].includes(process.env.PROCESS_NAME || '')) {
    const { consumeQueue, consumeRPCQueue } = client;

    consumeQueue('registerPermissions', async permissions => {
      await registerModule(permissions);
    });

    consumeQueue('core:sendMobileNotification', async ({ data }) => {
      await sendMobileNotification(data);
    });

    consumeQueue('core:sendEmail', async ({ data }) => {
      await sendEmail(data);
    });

    consumeRPCQueue('core:conformities.addConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.addConformity(data)
    }));

    consumeRPCQueue('core:conformities.savedConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.savedConformity(data)
    }));

    consumeQueue('core:conformities.create', async ({ data }) => ({
      status: 'success',
      data: await Conformities.create(data)
    }));

    consumeQueue('core:conformities.removeConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.removeConformities(data)
    }));

    consumeQueue('core:conformities.removeConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.removeConformity(data)
    }));

    consumeRPCQueue('core:conformities.getConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.getConformities(data)
    }));

    consumeQueue('core:conformities.addConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.addConformities(data)
    }));

    consumeRPCQueue('core:conformities.relatedConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.relatedConformity(data)
    }));

    consumeRPCQueue('core:conformities.filterConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.filterConformity(data)
    }));

    // graphql subscriptions call =========
    consumeQueue('callPublish', params => {
      graphqlPubsub.publish(params.name, params.data);
    });

    // listen for rpc queue =========
    consumeQueue(
      'core:registerOnboardHistory',
      async ({ data: { type, user } }) => {
        await registerOnboardHistory(type, user);
      }
    );

    consumeRPCQueue('core:configs.find', async ({ data }) => ({
      status: 'success',
      data: await Configs.find(data).distinct('value')
    }));

    consumeRPCQueue('core:getConfig', async (
      { data: { code, defaultValue } }
    ) => {
      return {
        status: 'success',
        data: await getConfig(code, defaultValue)
      }
    });

    consumeRPCQueue('core:users.findOne', async ({ data }) => ({
      status: 'success',
      data: await Users.findOne(data)
    }));

    consumeRPCQueue('core:users.updateOne', async ({ data: { selector, modifier } }) => {
      return {
        status: 'success',
        data: await Users.updateOne(selector, modifier)
      };
    });

    consumeRPCQueue('core:users.find', async data => {
      const { query } = data;

      return {
        status: 'success',
        data: await Users.find(query).lean()
      };
    });

    consumeRPCQueue('core:brands.findOne', async query => ({
      status: 'success',
      data: await Brands.findOne(query)
    }));

    consumeRPCQueue('core:brands.find', async data => {
      const { query } = data;

      return {
        status: 'success',
        data: await Brands.find(query).lean()
      };
    });

    consumeRPCQueue('core:getFileUploadConfigs', async () => {
      return {
        status: 'success',
        data: await getFileUploadConfigs()
      };
    });

    consumeRPCQueue('core:emailDeliveries.createEmailDelivery', async ({ data }) => {
      return {
        status: 'success',
        data: await EmailDeliveries.createEmailDelivery(data)
      };
    });

    logConsumers({
      name: 'core',
      consumeRPCQueue,
      getActivityContent: logUtils.getActivityContent,
      collectItems: logUtils.collectItems,
      getSchemalabels: logUtils.getSchemaLabels
    });

    internalNoteConsumers({
      name: 'core',
      consumeRPCQueue,
      generateInternalNoteNotif: internalNotes.generateInternalNoteNotif
    })
  }

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const fetchSegment = (segmentId, options?) =>
  sendRPCMessage('segments:rpc_queue:fetchSegment', {
    segmentId,
    options
  });

export default function () {
  return client;
}