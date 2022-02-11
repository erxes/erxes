import { getUserDetail } from "@erxes/api-utils/src";
import { Users } from "./apiCollections";
import { graphqlPubsub } from "./configs";
import { Notifications } from "./models";

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

const sendNotification = async (doc: ISendNotification) => {
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
      const notification = await Notifications.createNotification(
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

      graphqlPubsub.publish("notificationInserted", {
        notificationInserted: {
          _id: notification._id,
          userId: receiverId,
          title: notification.title,
          content: notification.content,
        },
      });
    } catch (e) {
      // Any other error is serious
      if (e.message !== "Configuration does not exist") {
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

  sendMessage("core:sendEmail", {
    doc: {
      toEmails,
      title: "Notification",
      template: {
        name: "notification",
        data: {
          notification: { ...doc, link },
          action,
          userName: getUserDetail(createdUser),
        },
      },
    },
    modifier,
  });
};

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = cl;

  consumeQueue("notifications:send", async (doc) => {
    await sendNotification(doc);
  });

  consumeQueue("notifications:batchUpdate", async (selector, modifier) => {
    await Notifications.update(
      selector,
      modifier,
      { multi: true }
    );
  });

  consumeRPCQueue('notifications:rpc_queue:checkIfRead', async ({ userId, itemId }) => ({
    status: 'success',
    data: await Notifications.checkIfRead(
      userId,
      itemId
    ),
  }));

  consumeRPCQueue('notifications:rpc_queue:find', async (selector, fields) => ({
    status: 'success',
    data: await Notifications.find(
      selector,
      fields
    ),
  }));
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};