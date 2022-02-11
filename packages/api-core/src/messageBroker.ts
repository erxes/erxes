import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import { Conformities, Forms, FieldsGroups, Fields } from './db/models';
import { fetchSegment } from './data/modules/segments/queryBuilder';
import { registerModule } from './data/permissions/utils';
import { sendEmail, sendMobileNotification } from './data/utils';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'api',
    server,
    envs: process.env
  });

  // do not receive messages in crons worker
  if (!['crons', 'workers'].includes(process.env.PROCESS_NAME || '')) {
    const { consumeQueue, consumeRPCQueue } = client;

    consumeQueue('registerPermissions', async permissions => {
      await registerModule(permissions);
    });

    consumeQueue('core:sendMobileNotification', async (doc) => {
      await sendMobileNotification(doc);
    });

    consumeQueue('core:sendEmail', async (doc) => {
      await sendEmail(doc);
    });

    consumeRPCQueue(
      'forms:rpc_queue:validate',
      async ({ formId, submissions }) => ({
        status: 'success',
        data: await Forms.validate(formId, submissions)
      })
    );

    consumeRPCQueue('forms:rpc_queue:duplicate', async ({ formId }) => ({
      status: 'success',
      data: await Forms.duplicate(formId)
    }));

    consumeQueue('forms:removeForm', async ({ formId }) => ({
      status: 'success',
      data: await Forms.removeForm(formId)
    }));

    consumeQueue('conformities:addConformity', async doc => ({
      status: 'success',
      data: await Conformities.addConformity(doc)
    }));

    consumeRPCQueue('conformities:savedConformity', async doc => ({
      status: 'success',
      data: await Conformities.savedConformity(doc)
    }));

    consumeQueue('conformities:create', async doc => ({
      status: 'success',
      data: await Conformities.create(doc)
    }));

    consumeQueue('conformities:removeConformities', async doc => ({
      status: 'success',
      data: await Conformities.removeConformities(doc)
    }));

    consumeQueue('conformities:removeConformity', async doc => ({
      status: 'success',
      data: await Conformities.removeConformity(doc)
    }));

    consumeRPCQueue('conformities:getConformities', async doc => ({
      status: 'success',
      data: await Conformities.getConformities(doc)
    }));

    consumeQueue('conformities:addConformities', async doc => ({
      status: 'success',
      data: await Conformities.addConformities(doc)
    }));

    consumeRPCQueue(
      'fields:rpc_queue:prepareCustomFieldsData',
      async ({ doc }) => ({
        status: 'success',
        data: await Fields.prepareCustomFieldsData(doc)
      })
    );

    consumeRPCQueue(
      'fields:rpc_queue:generateCustomFieldsData',
      async ({ customData, contentType }) => ({
        status: 'success',
        data: await Fields.generateCustomFieldsData(customData, contentType)
      })
    );

    consumeRPCQueue('rpc_queue:fetchSegment', async ({ segment, options }) => {
      const data = await fetchSegment(segment, options);
      return { data, status: 'success' };
    });

    // graphql subscriptions call =========
    consumeQueue('callPublish', params => {
      graphqlPubsub.publish(params.name, params.data);
    });

    // listen for rpc queue =========
    consumeQueue('registerOnboardHistory', async ({ type, user }) => {
      await registerOnboardHistory(type, user);
    });

    consumeQueue(
      'fieldsGroups:updateGroup',
      async ({ groupId, fieldsGroup }) => ({
        status: 'success',
        data: await FieldsGroups.updateGroup(groupId, fieldsGroup)
      })
    );
  }

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  console.log(channel, message);
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
