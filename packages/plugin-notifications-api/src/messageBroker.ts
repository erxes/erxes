import { getUserDetail } from '@erxes/api-utils/src';
import { graphqlPubsub } from './configs';
import { IModels } from './connectionResolver';
import { generateModels } from './connectionResolver';
import {
  ISendMessageArgs,
  sendMessage,
  getEnv
} from '@erxes/api-utils/src/core';
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
    contentTypeId
  } = doc;

  let link = doc.link;

  // remove duplicated ids
  const receiverIds = [...Array.from(new Set(receivers))];

  await sendCoreMessage({
    subdomain,
    action: 'users.updateMany',
    data: {
      selector: {
        _id: { $in: receiverIds }
      },
      modifier: {
        $set: { isShowNotification: false }
      }
    }
  });

  for (const userId of doc.receivers) {
    graphqlPubsub.publish('userChanged', {
      userChanged: { userId }
    });
  }

  // collecting emails
  const recipients = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        _id: { $in: receiverIds },
        isActive: true
      }
    },
    isRPC: true,
    defaultValue: []
  });

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
          contentTypeId
        },
        createdUser._id
      );

      graphqlPubsub.publish('notificationInserted', {
        notificationInserted: {
          _id: notification._id,
          userId: receiverId,
          title: notification.title,
          content: notification.content
        }
      });
    } catch (e) {
      // Any other error is serious
      if (e.message !== 'Configuration does not exist') {
        throw e;
      }
    }
  } // end receiverIds loop

  const DOMAIN = getEnv({ name: 'DOMAIN' });

  link = `${DOMAIN}${link}`;

  // for controlling email template data filling
  const modifier = (data: any, email: string) => {
    const user = recipients.find(item => item.email === email);

    if (user) {
      data.uid = user._id;
    }
  };

  sendCoreMessage({
    subdomain,
    action: 'sendEmail',
    data: {
      toEmails,
      title: 'Notification',
      template: {
        name: 'notification',
        data: {
          notification: { ...doc, link },
          action,
          userName: getUserDetail(createdUser)
        }
      },
      modifier
    }
  });
};

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = cl;

  consumeQueue('notifications:send', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, data);
  });

  consumeQueue(
    'notifications:batchUpdate',
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);
      await models.Notifications.update(selector, modifier, { multi: true });
    }
  );

  consumeRPCQueue(
    'notifications:checkIfRead',
    async ({ subdomain, data: { userId, itemId } }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.Notifications.checkIfRead(userId, itemId)
      };
    }
  );

  consumeRPCQueue(
    'notifications:find',
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: await models.Notifications.find(selector, fields)
      };
    }
  );
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};
