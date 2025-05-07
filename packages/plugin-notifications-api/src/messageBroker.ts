import { getUserDetail } from "@erxes/api-utils/src";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { IModels } from "./connectionResolver";
import { generateModels } from "./connectionResolver";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
  getEnv
} from "@erxes/api-utils/src/core";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { debugError } from "@erxes/api-utils/src/debuggers";

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
  toMail: string,
}


interface INotificationRecipient {
  _id: string;
  email?: string;
  getNotificationByEmail?: boolean;
  isActive?: boolean;
}

const sendNotification = async (
  models: IModels,
  subdomain: string,
  doc: ISendNotification
) => {
  const {
    createdUser,
    receivers = [],
    title,
    content,
    notifType,
    action,
    contentType,
    contentTypeId,
    toMail,
    link: originalLink = ''
  } = doc;

  try {
    const receiverIds = Array.from(new Set(receivers.filter(Boolean)));
    if (!receiverIds.length) {
      console.warn('No valid receivers specified for notification');
      return;
    }

    await markNotificationsAsUnread(subdomain, receiverIds);

    const recipients = await getActiveRecipients(subdomain, receiverIds);
    const toEmails = getNotificationEmails(recipients, toMail);

    await processNotifications(
      models,
      subdomain,
      receiverIds,
      {
        link: originalLink,
        title,
        content,
        notifType,
        action,
        contentType,
        contentTypeId
      },
      createdUser._id
    );

    if (toEmails.length) {
      await sendEmailNotification(
        subdomain,
        {
          ...doc,
          link: `${getEnv({ name: "DOMAIN", subdomain })}${originalLink}`
        },
        toEmails,
        recipients,
        action,
        createdUser
      );
    }
  } catch (error) {
    console.error('Notification processing failed:', {
      error: error.message,
      contentType,
      contentTypeId,
      createdUserId: createdUser._id
    });
    throw error;
  }
};

async function markNotificationsAsUnread(subdomain: string, receiverIds: string[]) {
  await sendCoreMessage({
    subdomain,
    action: "users.updateMany",
    data: {
      selector: { _id: { $in: receiverIds } },
      modifier: { $set: { isShowNotification: false } }
    }
  });
}

async function getActiveRecipients(subdomain: string, receiverIds: string[]): Promise<INotificationRecipient[]> {
  return await sendCoreMessage({
    subdomain,
    action: "users.find",
    data: {
      query: {
        _id: { $in: receiverIds },
        isActive: true
      }
    },
    isRPC: true,
    defaultValue: []
  });
}

function getNotificationEmails(recipients: INotificationRecipient[], fallbackEmail?: string): string[] {
  const emails = recipients
    .filter(r => r.getNotificationByEmail && r.email)
    .map(r => r.email as string);

  return emails.length ? emails : fallbackEmail ? [fallbackEmail] : [];
}

async function processNotifications(
  models: IModels,
  subdomain: string,
  receiverIds: string[],
  notificationData: {
    link: string;
    title: string;
    content: string;
    notifType: string;
    action: string;
    contentType: string;
    contentTypeId: string;
  },
  createdUserId: string
) {
  await Promise.all(receiverIds.map(async receiverId => {
    try {
      const notification = await models.Notifications.createNotification(
        { ...notificationData, receiver: receiverId },
        createdUserId
      );

      graphqlPubsub.publish(`notificationInserted:${subdomain}:${receiverId}`, {
        notificationInserted: {
          _id: notification._id,
          userId: receiverId,
          title: notification.title,
          content: notification.content
        }
      });
    } catch (e) {
      if (e.message !== "Configuration does not exist") {
        console.error(`Failed to create notification for ${receiverId}:`, e);
        throw e;
      }
    }
  }));
}

async function sendEmailNotification(
  subdomain: string,
  doc: ISendNotification & { link: string },
  toEmails: string[],
  recipients: INotificationRecipient[],
  action: string,
  createdUser: any
) {
  try {
    await sendCoreMessage({
      subdomain,
      action: "sendEmail",
      data: {
        toEmails,
        title: "Notification",
        template: {
          name: "notification",
          data: {
            notification: doc,
            action,
            userName: getUserDetail(createdUser)
          }
        },
        modifier: (data: any, email: string) => {
          const user = recipients.find(item => item.email === email);
          if (user) data.uid = user._id;
        }
      }
    });
  } catch (err) {
    console.error('Failed to send email notification:', {
      error: err.message,
      emails: toEmails
    });
  }
}

export const setupMessageConsumers = async () => {
  consumeQueue("notifications:send", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, data);
  });

  consumeRPCQueue("notifications:send", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, data);

    return {
      status: "success"
    };
  });

  consumeQueue(
    "notifications:batchUpdate",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);
      await models.Notifications.updateMany(selector, modifier);
    }
  );

  consumeRPCQueue(
    "notifications:checkIfRead",
    async ({ subdomain, data: { userId, itemId } }) => {
      const models = await generateModels(subdomain);
      return {
        status: "success",
        data: await models.Notifications.checkIfRead(userId, itemId)
      };
    }
  );

  consumeRPCQueue(
    "notifications:find",
    async ({ subdomain, data: { selector, fields } }) => {
      const models = await generateModels(subdomain);
      return {
        status: "success",
        data: await models.Notifications.find(selector, fields)
      };
    }
  );
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
) => {
  return sendMessage({
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "segments",
    ...args
  });
};

export const sendClientPortalMessagge = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "clientportal",
    ...args
  });
};
