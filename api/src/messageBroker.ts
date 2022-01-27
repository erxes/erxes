import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import {
  Conformities,
  Forms,
  InternalNotes,
  FieldsGroups,
  Fields
} from './db/models';
import { fieldsCombinedByContentType } from './data/modules/fields/utils';
import {
  generateAmounts,
  generateProducts,
  getSubServiceDomain
} from './data/utils';
import { fetchSegment } from './data/modules/segments/queryBuilder';

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

    // general ======================
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

    consumeRPCQueue('conformities:rpc_queue:savedConformity', async doc => ({
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

    consumeRPCQueue('conformities:rpc_queue:getConformities', async doc => ({
      status: 'success',
      data: await Conformities.getConformities(doc)
    }));

    consumeQueue('conformities:addConformities', async doc => ({
      status: 'success',
      data: await Conformities.addConformities(doc)
    }));

    consumeQueue(
      'internalNotes:removeInternalNotes',
      async ({ type, itemIds }) => ({
        status: 'success',
        data: await InternalNotes.removeInternalNotes(type, itemIds)
      })
    );

    consumeRPCQueue(
      'fields:rpc_queue:prepareCustomFieldsData',
      async ({ doc }) => ({
        status: 'success',
        data: await Fields.prepareCustomFieldsData(doc)
      })
    );

    consumeRPCQueue(
      'rpc_queue:engageUtils_savedConformity_to_api',
      async (mainType, mainTypeId, relTypes) => {
        const data = await Conformities.savedConformity({
          mainType,
          mainTypeId,
          relTypes
        });

        return { data, status: 'success' };
      }
    );

    consumeRPCQueue(
      'rpc_queue:engageUtils_fetchSegment_to_api',
      async (segment, options: any = {}) => {
        const data = await fetchSegment({
          segment,
          options
        });

        return { data, status: 'success' };
      }
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_fieldsCombinedByContentType_to_api',
      async contentType => {
        const f = await fieldsCombinedByContentType({
          contentType
        });

        return {
          status: 'success',
          data: f
        };
      }
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_generateAmounts_to_api',
      async productsData => ({
        data: await generateAmounts(productsData),
        status: 'success'
      })
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_generateProducts_to_api',
      async productsData => ({
        data: await generateProducts(productsData),
        status: 'success'
      })
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_getSubServiceDomain_to_api',
      name => ({ data: getSubServiceDomain(name), status: 'success' })
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
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
