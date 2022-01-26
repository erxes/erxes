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
import {
  Integrations,
  Conformities,
  Customers,
  Forms,
  Companies,
  Checklists,
  InternalNotes,
  FieldsGroups,
  Notifications,
  Fields,
  Conversations,
  EngageMessages
} from './db/models';
import { fieldsCombinedByContentType } from './data/modules/fields/utils';
import { generateAmounts, generateProducts } from './data/resolvers/deals';
import { findCompany, findCustomer, getSubServiceDomain } from './data/utils';
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

    // contacts ======================
    consumeRPCQueue('contacts:rpc_queue:findCustomer', async doc => ({
      status: 'success',
      data: await findCustomer(doc)
    }));

    consumeRPCQueue('contacts:rpc_queue:findCompany', async doc => ({
      status: 'success',
      data: await findCompany(doc)
    }));

    consumeRPCQueue(
      'contacts:rpc_queue:findActiveCustomers',
      async ({ selector, fields }) => ({
        status: 'success',
        data: await Customers.findActiveCustomers(selector, fields)
      })
    );

    consumeRPCQueue(
      'contacts:rpc_queue:findActiveCompanies',
      async ({ selector, fields }) => ({
        status: 'success',
        data: await Companies.findActiveCompanies(selector, fields)
      })
    );

    consumeRPCQueue('contacts:rpc_queue:create_customer', async data => ({
      status: 'success',
      data: await Customers.createCustomer(data)
    }));

    consumeRPCQueue('contacts:rpc_queue:createCompany', async data => ({
      status: 'success',
      data: await Companies.createCompany(data)
    }));

    consumeRPCQueue(
      'contacts:rpc_queue:updateCustomer',
      async ({ _id, doc }) => ({
        status: 'success',
        data: await Customers.updateCustomer(_id, doc)
      })
    );

    consumeRPCQueue(
      'contacts:rpc_queue:updateCompany',
      async ({ _id, doc }) => ({
        status: 'success',
        data: await Companies.updateCompany(_id, doc)
      })
    );

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

    consumeRPCQueue(
      'contacts:rpc_queue:saveVisitorContactInfo',
      async data => ({
        status: 'success',
        data: await Customers.saveVisitorContactInfo(data)
      })
    );

    consumeQueue('contacts:updateLocation', ({ customerId, browserInfo }) =>
      Customers.updateLocation(customerId, browserInfo)
    );

    consumeQueue('contacts:updateSession', ({ customerId }) =>
      Customers.updateSession(customerId)
    );

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

    consumeQueue('checklists:removeChecklists', async ({ type, itemIds }) => ({
      status: 'success',
      data: await Checklists.removeChecklists(type, itemIds)
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

    consumeRPCQueue(
      'notifications:rpc_queue:checkIfRead',
      async ({ userId, itemId }) => ({
        status: 'success',
        data: await Notifications.checkIfRead(userId, itemId)
      })
    );

    consumeRPCQueue(
      'notifications:rpc_queue:createNotification',
      async ({ params, userId }) => ({
        status: 'success',
        data: await Notifications.createNotification(params, userId)
      })
    );

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
      ) => {
        const data = await createConversationAndMessage(
          userId,
          status,
          customerId,
          visitorId,
          integrationId,
          content,
          engageData
        );

        return { data, status: 'success' };
      }
    );

    consumeRPCQueue(
      'rpc_queue:findIntegrations',
      async ({ query, options }) => {
        const integrations = await Integrations.findIntegrations(
          query,
          options
        );

        return { data: integrations, status: 'success' };
      }
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

    consumeRPCQueue(
      'rpc_queue:editorAttributeUtils_getCustomerName_to_api',
      async customer => ({
        data: await Customers.getCustomerName(customer),
        status: 'success'
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

    consumeQueue('integrationsNotification', async data => {
      await receiveIntegrationsNotification(data);
    });

    consumeQueue('engagesNotification', async data => {
      await receiveEngagesNotification(data);
    });

    // listen for rpc queue =========
    consumeQueue('registerOnboardHistory', async ({ type, user }) => {
      await registerOnboardHistory(type, user);
    });

    consumeQueue('removeEngageConversations', async data => {
      await removeEngageConversations(data);
    });

    consumeQueue('visitor:convertResponse', async data => {
      await receiveVisitorDetail(data);
    });

    consumeQueue(
      'fieldsGroups:updateGroup',
      async ({ groupId, fieldsGroup }) => ({
        status: 'success',
        data: await FieldsGroups.updateGroup(groupId, fieldsGroup)
      })
    );

    consumeQueue('contact:removeCustomersConversations', async customerIds => {
      await Conversations.removeCustomersConversations(customerIds);
    });

    consumeQueue('contact:changeCustomer', async (customerId, customerIds) => {
      await Conversations.changeCustomer(customerId, customerIds);
    });

    consumeQueue('engage:removeCustomersEngages', async customerIds => {
      await EngageMessages.removeCustomersEngages(customerIds);
    });

    consumeQueue('engage:changeCustomer', async (customerId, customerIds) => {
      await EngageMessages.changeCustomer(customerId, customerIds);
    });

    pluginsConsume(client);
  }
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
