import { Fields, FieldsGroups, Forms } from './models';
import { sendMessage } from '@erxes/api-utils/src/core';
import { fieldsCombinedByContentType } from './utils';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue(
    'forms:validate',
    async ({ data: { formId, submissions } }) => ({
      status: 'success',
      data: await Forms.validate(formId, submissions)
    })
  );

  consumeRPCQueue('forms:rpc_queue:duplicate', async ({ data: { formId } }) => ({
    status: 'success',
    data: await Forms.duplicate(formId)
  }));

  consumeQueue('forms:removeForm', async ({ formId }) => ({
    status: 'success',
    data: await Forms.removeForm(formId)
  }));

  consumeRPCQueue('forms:fields.prepareCustomFieldsData', async ({ data }) => ({
    status: 'success',
    data: await Fields.prepareCustomFieldsData(data)
  }));

  consumeRPCQueue(
    'forms:fields.generateCustomFieldsData',
    async ({ data: { customData, contentType }}) => {
      return {
        status: 'success',
        data: await Fields.generateCustomFieldsData(customData, contentType)
      };
  });

  consumeQueue('forms:updateGroup', async ({ groupId, fieldsGroup }) => ({
    status: 'success',
    data: await FieldsGroups.updateGroup(groupId, fieldsGroup)
  }));

  consumeRPCQueue(
    'forms:fields.find',
    async ({ data: { query, projection, sort }}) => {
      return {
        status: 'success',
        data: await Fields.find(query, projection)
          .sort(sort)
          .lean()
      };
    }
  );

  consumeRPCQueue('forms:fieldsCombinedByContentType', async ({ data }) => {
    return {
      status: 'success',
      data: await fieldsCombinedByContentType(data)
    };
  });
};

export const fetchService = async (
  contentType: string,
  action: string,
  data,
  defaultValue?
) => {
  const [serviceName, type] = contentType.split(':');

  return sendMessage({
    subdomain: 'os',
    serviceDiscovery,
    client,
    isRPC: true,
    serviceName,
    action: `fields.${action}`,
    data: {
      ...data,
      type
    },
    defaultValue
  });
};

export default function() {
  return client;
}