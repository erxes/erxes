import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import {
  receiveEngagesNotification,
  receiveIntegrationsNotification,
  receiveRpcMessage,
  removeEngageConversations
} from './data/modules/integrations/receiveMessage';
import { receiveRpcMessage as receiveAutomations } from './data/modules/automations';
import { pluginsConsume } from './pluginUtils';
import { graphqlPubsub } from './pubsub';
import { receiveVisitorDetail } from './data/widgetUtils';
import { registerOnboardHistory } from './data/modules/robot';
import { createConversationAndMessage } from './data/modules/conversations/utils';
import { Integrations, Conformities, Customers } from './db/models';
import { fieldsCombinedByContentType } from './data/modules/fields/utils';
import { generateAmounts, generateProducts } from './data/resolvers/deals';
import { getSubServiceDomain } from './data/utils';
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

    consumeRPCQueue('contacts:rpc_queue:create_customer', async data => ({
      status: 'success',
      data: await Customers.createCustomer(data)
    }));

    consumeRPCQueue('contacts:rpc_queue:getWidgetCustomer', async data => ({
      status: 'success',
      data: await Customers.getWidgetCustomer(data)
    }));

    consumeRPCQueue(
      'contacts:rpc_queue:updateMessengerCustomer',
      async data => ({
        status: 'success',
        data: await Customers.updateMessengerCustomer(data)
      })
    );

    consumeRPCQueue(
      'contacts:rpc_queue:createMessengerCustomer',
      async data => ({
        status: 'success',
        data: await Customers.createMessengerCustomer(data)
      })
    );

    consumeQueue('contacts:updateLocation', ({ customerId, browserInfo }) =>
      Customers.updateLocation(customerId, browserInfo)
    );

    consumeQueue('contacts:updateSession', ({ customerId }) =>
      Customers.updateSession(customerId)
    );

    // listen for rpc queue =========
    consumeRPCQueue(
      'rpc_queue:integrations_to_api',
      async data => await receiveRpcMessage(data)
    );

    consumeRPCQueue(
      'rpc_queue:automations_to_api',
      async data => await receiveAutomations(data)
    );

    consumeRPCQueue(
      'rpc_queue:engagePluginApi_to_api',
      async (
        userId,
        status,
        customerId,
        visitorId,
        integrationId,
        content,
        engageData
      ) =>
        await createConversationAndMessage(
          userId,
          status,
          customerId,
          visitorId,
          integrationId,
          content,
          engageData
        )
    );

    consumeRPCQueue(
      'rpc_queue:engageUtils_findIntegrations_to_api',
      async data => await Integrations.findIntegrations({ brandId: data })
    );

    consumeRPCQueue(
      'rpc_queue:engageUtils_savedConformity_to_api',
      async (mainType, mainTypeId, relTypes) =>
        await Conformities.savedConformity({
          mainType,
          mainTypeId,
          relTypes
        })
    );

    consumeRPCQueue(
      'rpc_queue:engageUtils_fetchSegment_to_api',
      async (segment, options: any = {}) =>
        await fetchSegment({
          segment,
          options
        })
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_fieldsCombinedByContentType_to_api',
      async contentType =>
        await fieldsCombinedByContentType({
          contentType
        })
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_generateAmounts_to_api',
      productsData => generateAmounts(productsData)
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_generateProducts_to_api',
      async productsData => await generateProducts(productsData)
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_getSubServiceDomain_to_api',
      name => getSubServiceDomain(name)
    );

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_getCustomerName_to_api',
      customer => Customers.getCustomerName(customer)
    );

    // graphql subscriptions call =========
    consumeQueue('callPublish', params => {
      graphqlPubsub.publish(params.name, params.data);
    });

    consumeQueue('integrationsNotification', async data => {
      await receiveIntegrationsNotification(data);
    });

    consumeQueue('engagesNotification', async data => {
      await receiveEngagesNotification(data);
    });

    // listen for rpc queue =========
    consumeQueue('registerOnboardHistory', async (type, user) => {
      await registerOnboardHistory(type, user);
    });

    consumeQueue('removeEngageConversations', async data => {
      await removeEngageConversations(data);
    });

    consumeQueue('visitor:convertResponse', async data => {
      await receiveVisitorDetail(data);
    });

    pluginsConsume(client);
  }
};

export default function() {
  return client;
}
