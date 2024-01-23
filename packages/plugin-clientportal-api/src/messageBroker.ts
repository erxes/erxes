import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';

import { generateModels, IModels } from './connectionResolver';
import { sendNotification, sendSms } from './utils';
import { createCard } from './models/utils';
import {
  consumeRPCQueue,
  consumeQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeRPCQueue(
    'clientportal:clientPortals.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortals.findOne(data),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortalUsers.findOne(data),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortalUsers.find(data).lean(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.getIds',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ClientPortalUsers.find(data).distinct('_id'),
      };
    },
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.create',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortalUsers.createUser(subdomain, data),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'clientportal:clientPortals.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortals.find(selector).count(),
        status: 'success',
      };
    },
  );

  consumeQueue(
    'clientportal:sendSMS',
    async ({ subdomain, data: { to, content } }) => {
      await sendSms(subdomain, 'messagePro', to, content);
    },
  );

  /**
   * Send notification to client portal
   * @param {Object} data
   * @param {String[]} data.receivers // client portal user ids
   * @param {String} data.title // notification title
   * @param {String} data.content // notification content
   * @param {String} data.notifType // notification type could be "system" or "engage"
   * @param {String} data.link // notification link
   * @param {Object} data.createdUser // user who created this notification
   * @param {Boolean} data.isMobile // is mobile notification
   */
  consumeQueue('clientportal:sendNotification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, data);
  });

  consumeQueue('clientportal:afterMutation', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return afterMutationHandlers(models, subdomain, data);
  });

  consumeRPCQueue(
    'clientportal:clientPortalUsers.createOrUpdate',
    async ({ subdomain, data: { rows } }) => {
      const models = await generateModels(subdomain);

      const operations: any = [];

      for (const row of rows) {
        const { selector, doc } = row;

        const prevEntry = await models.ClientPortalUsers.findOne(selector, {
          _id: 1,
        }).lean();

        if (prevEntry) {
          operations.push({
            updateOne: { filter: selector, update: { $set: doc } },
          });
        } else {
          const customer = await sendContactsMessage({
            subdomain,
            action: 'customers.findOne',
            data: { primaryEmail: doc.email },
            isRPC: true,
          });

          if (doc.email && customer) {
            doc.erxesCustomerId = customer._id;
            doc.createdAt = new Date();
            doc.modifiedAt = new Date();

            operations.push({ insertOne: { document: doc } });
          }
        }
      }

      return {
        data: models.ClientPortalUsers.bulkWrite(operations),
        status: 'success',
      };
    },
  );

  consumeRPCQueue('clientportal:createCard', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { cpUser, doc } = data;

    const card = await createCard(subdomain, models, cpUser, doc);

    return {
      data: card,
      status: 'success',
    };
  });

  consumeRPCQueue(
    'clientportal:clientPortalUsers.validatePassword',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { userId, password, secondary } = data;

      const valid = await models.ClientPortalUsers.validatePassword(
        userId,
        password,
        secondary,
      );

      if (!valid) {
        return {
          status: 'error',
          errorMessage: 'Invalid password',
        };
      }

      return {
        data: valid,
        status: 'success',
      };
    },
  );
};

export const sendCoreMessage = async (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendContactsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendKbMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'knowledgebase',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
