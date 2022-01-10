import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';
import { Logs } from './models';
import { sendBulkSms, start } from './sender';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  // listen for rpc queue =========
  consumeQueue('erxes-api:engages-notification', async ({ action, data }) => {
    debugBase(`Receiving queue data from erxes-api ${JSON.stringify(data)}`);

    if (action === 'sendEngage') {
      await start(data);
    }

    if (action === 'writeLog') {
      await Logs.createLog(data.engageMessageId, 'regular', data.msg);
    }

    if (action === 'sendEngageSms') {
      await sendBulkSms(data);
    }
  });
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const createRPCconversationAndMessage = async (
  userId,
  status,
  customerId,
  visitorId,
  integrationId,
  content,
  engageData
): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:engagePluginApi_to_api',
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content,
    engageData
  );
};

export const findRPCintegrations = async (data): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:engageUtils_findIntegrations_to_api',
    data
  );
};

export const saveRPCconformity = async (
  mainType,
  mainTypeId,
  relTypes
): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:engageUtils_savedConformity_to_api',
    mainType,
    mainTypeId,
    relTypes
  );
};

export const fieldsCombinedByContentType = async (
  contentType
): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:editorAttributeUtils_fieldsCombinedByContentType_to_api',
    contentType
  );
};

export const generateAmounts = productsData => {
  return client.sendRPCMessage(
    'rpc_queue:editorAttributeUtils_generateAmounts_to_api',
    productsData
  );
};

export const generateProducts = async (productsData): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:editorAttributeUtils_generateProducts_to_api',
    productsData
  );
};

export const getSubServiceDomain = name => {
  return client.sendRPCMessage(
    'rpc_queue:editorAttributeUtils_getSubServiceDomain_to_api',
    name
  );
};

export const getCustomerName = customer => {
  return client.sendRPCMessage(
    'rpc_queue:editorAttributeUtils_getCustomerName_to_api',
    customer
  );
};

export const fetchSegment = async (segment, options): Promise<any> => {
  return client.sendRPCMessage(
    'rpc_queue:engageUtils_fetchSegment_to_api',
    segment,
    options
  );
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export const registerOnboardHistory = async (
  type: string,
  user: any
): Promise<any> => {
  return client.consumeQueue('registerOnboardHistory', type, user);
};

export default function() {
  return client;
}
