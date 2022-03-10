import { serviceDiscovery } from './configs';
import { Fields, FieldsGroups, Forms } from './models';
import { fieldsCombinedByContentType } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

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

  consumeRPCQueue('forms:rpc_queue:prepareCustomFieldsData', async data => ({
    status: 'success',
    data: await Fields.prepareCustomFieldsData(data)
  }));

  consumeRPCQueue(
    'forms:rpc_queue:generateCustomFieldsData',
    async ({ customData, contentType }) => ({
      status: 'success',
      data: await Fields.generateCustomFieldsData(customData, contentType)
    })
  );

  consumeQueue('forms:updateGroup', async ({ groupId, fieldsGroup }) => ({
    status: 'success',
    data: await FieldsGroups.updateGroup(groupId, fieldsGroup)
  }));

  consumeRPCQueue(
    'forms:rpc_queue:findFields',
    async ({ query, projection, sort }) => {
      return {
        status: 'success',
        data: await Fields.find(query, projection)
          .sort(sort)
          .lean()
      };
    }
  );

  consumeRPCQueue('forms:rpc_queue:fieldsCombinedByContentType', async arg => {
    return {
      status: 'success',
      data: await fieldsCombinedByContentType(arg)
    };
  });
};

export const fetchService = async (
  contentType: string,
  action: string,
  data,
  defaultValue
) => {
  const [serviceName, type] = contentType.split(':');

  // const xxa = await serviceDiscovery.isEnabled(serviceName);

  // console.log(serviceName, xxa);

  // if (!(await serviceDiscovery.isEnabled(serviceName))) {
  //   return defaultValue;
  // }

  // if (!(await serviceDiscovery.isAvailable(serviceName))) {
  //   throw new Error(`${serviceName} service is not available.`);
  // }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:fields:${action}`, {
    ...data,
    type
  });
};

export default function() {
  return client;
}
