import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { fieldsCombinedByContentType } from './utils';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue(
    'forms:validate',
    async ({ subdomain, data: { formId, submissions } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.validate(formId, submissions)
      };
    }
  );

  consumeRPCQueue('forms:find', async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Forms.find(query)
    };
  });

  consumeRPCQueue('forms:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Forms.findOne(data)
    };
  });

  consumeRPCQueue(
    'forms:duplicate',
    async ({ subdomain, data: { formId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.duplicate(formId)
      };
    }
  );

  consumeRPCQueue(
    'forms:createForm',
    async ({ subdomain, data: { formDoc, userId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.createForm(formDoc, userId)
      };
    }
  );

  consumeRPCQueue(
    'forms:removeForm',
    async ({ subdomain, data: { formId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Forms.removeForm(formId)
      };
    }
  );

  consumeQueue(
    'forms:fields.insertMany',
    async ({ subdomain, data: { fields } }) => {
      const models = await generateModels(subdomain);

      return models.Fields.insertMany(fields);
    }
  );

  consumeRPCQueue(
    'forms:fields.prepareCustomFieldsData',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.Fields.prepareCustomFieldsData(data)
      };
    }
  );

  consumeRPCQueue(
    'forms:fields.generateCustomFieldsData',
    async ({ subdomain, data: { customData, contentType } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.generateCustomFieldsData(
          customData,
          contentType
        )
      };
    }
  );

  consumeRPCQueue(
    'forms:fields.generateTypedListFromMap',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.generateTypedListFromMap(data)
      };
    }
  );

  consumeQueue(
    'forms:updateGroup',
    async ({ subdomain, data: { groupId, fieldsGroup } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.updateGroup(groupId, fieldsGroup)
      };
    }
  );

  consumeRPCQueue(
    'forms:fields.find',
    async ({ subdomain, data: { query, projection, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.find(query, projection)
          .sort(sort)
          .lean()
      };
    }
  );

  consumeRPCQueue(
    'forms:fields.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Fields.findOne(query)
      };
    }
  );

  consumeRPCQueue(
    'forms:fieldsGroups.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.find(query)
      };
    }
  );

  consumeRPCQueue(
    'forms:fieldsGroups.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FieldsGroups.findOne(query)
      };
    }
  );

  consumeRPCQueue(
    'forms:fieldsCombinedByContentType',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await fieldsCombinedByContentType(models, subdomain, data)
      };
    }
  );

  consumeRPCQueue(
    'forms:submissions.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FormSubmissions.find(query)
      };
    }
  );

  consumeQueue(
    'forms:submissions.createFormSubmission',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.FormSubmissions.createFormSubmission(data)
      };
    }
  );
};

export const fetchService = async (
  subdomain: string,
  contentType: string,
  action: string,
  data,
  defaultValue?
) => {
  const [serviceName, type] = contentType.split(':');

  return sendMessage({
    subdomain,
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

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
