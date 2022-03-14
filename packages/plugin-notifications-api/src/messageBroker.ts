import { getUserDetail } from '@erxes/api-utils/src';
import { Users } from './apiCollections';
import { graphqlPubsub } from './configs';
import { IModels } from './connectionResolver';
import { generateModels } from './connectionResolver';
import { sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

interface ISendNotification {
  createdUser;
  receivers: string[];
  title: string;
  content: string;
  notifType: string;
  link: string;
  action: string;
  contentType: string;
  contentTypeId: string;
}

const sendNotification = async (
  models: IModels,
  subdomain: string,
  doc: ISendNotification
) => {
  const {
    createdUser,
    receivers,
    title,
    content,
    notifType,
    action,
    contentType,
    contentTypeId,
  } = doc;

  const link = doc.link;

  // remove duplicated ids
  const receiverIds = [...Array.from(new Set(receivers))];

  // collecting emails
  const recipients = await Users.find({
    _id: { $in: receiverIds },
    isActive: true,
  }).toArray();

  // collect recipient emails
  const toEmails: string[] = [];

  for (const recipient of recipients) {
    if (recipient.getNotificationByEmail && recipient.email) {
      toEmails.push(recipient.email);
    }
  }

  // loop through receiver ids
  for (const receiverId of receiverIds) {
    try {
      // send web and mobile notification
      const notification = await models.Notifications.createNotification(
        {
          link,
          title,
          content,
          notifType,
          receiver: receiverId,
          action,
          contentType,
          contentTypeId,
        },
        createdUser._id
      );

      graphqlPubsub.publish('notificationInserted', {
        notificationInserted: {
          _id: notification._id,
          userId: receiverId,
          title: notification.title,
          content: notification.content,
        },
      });
    } catch (e) {
      // Any other error is serious
      if (e.message !== 'Configuration does not exist') {
        throw e;
      }
    }
  } // end receiverIds loop

  // for controlling email template data filling
  const modifier = (data: any, email: string) => {
    const user = recipients.find((item) => item.email === email);

    if (user) {
      data.uid = user._id;
    }
  };

  sendCoreMessage({
    subdomain,
    serviceName: '',
    action: 'core:sendEmail',
    data: {
      doc: {
        toEmails,
        title: 'Notification',
        template: {
          name: 'notification',
          data: {
            notification: { ...doc, link },
            action,
            userName: getUserDetail(createdUser),
          },
        },
      },
      modifier,
    },
  });
};

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = cl;

  consumeQueue('notifications:send', async ({ subdomain, doc }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, doc);
  });

  consumeQueue(
    'notifications:batchUpdate',
    async ({ subdomain, selector, modifier }) => {
      const models = await generateModels(subdomain);
      await models.Notifications.update(selector, modifier, { multi: true });
    }
  );

  consumeRPCQueue(
    'notifications:checkIfRead',
    async ({ subdomain, userId, itemId }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.Notifications.checkIfRead(userId, itemId),
      };
    }
  );

  consumeRPCQueue('notifications:find', async (subdomain, selector, fields) => {
    const models = await generateModels(subdomain);
    return {
      status: 'success',
      data: await models.Notifications.find(selector, fields),
    };
  });
};

export const sendCoreMessage = async ({
  serviceName,
  action,
  subdomain,
  data,
}): Promise<any> => {
  return sendMessage({
    subdomain,
    client,
    serviceDiscovery,
    serviceName,
    action,
    data,
  });
};
