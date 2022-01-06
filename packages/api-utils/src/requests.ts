import { debugExternalApi } from './debuggers';
import * as requestify from 'requestify';
import * as admin from 'firebase-admin';
import { sendEmail } from './emails';
import { getEnv, getUserDetail } from './core';
import { IUserDocument } from './types';
import { WEBHOOK_TYPES } from './constants';

export interface IRequestParams {
  url?: string;
  path?: string;
  method?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: string };
  body?: { [key: string]: any };
  form?: { [key: string]: string };
}

const initFirebase = async (models): Promise<void> => {
  const config = await models.Configs.findOne({
    code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  });

  if (!config) {
    return;
  }

  const codeString = config.value || 'value';

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
};

/**
 * Sends post request to specific url
 */
export const sendRequest = async (
  { url, method, headers, form, body, params }: IRequestParams,
  errorMessage?: string
) => {
  debugExternalApi(`
    Sending request to
    url: ${url}
    method: ${method}
    body: ${JSON.stringify(body)}
    params: ${JSON.stringify(params)}
  `);

  try {
    const response = await requestify.request(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      form,
      body,
      params,
    });

    const responseBody = response.getBody();

    debugExternalApi(`
      Success from : ${url}
      responseBody: ${JSON.stringify(responseBody)}
    `);

    return responseBody;
  } catch (e) {
    if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
      throw new Error(errorMessage);
    } else {
      const message = e.body || e.message;
      throw new Error(message);
    }
  }
};

export interface ISendNotification {
  createdUser: IUserDocument;
  receivers: string[];
  title: string;
  content: string;
  notifType: string;
  link: string;
  action: string;
  contentType: string;
  contentTypeId: string;
}

/**
 * Send a notification
 */
export const sendNotification = async (
  models: any,
  memoryStorage,
  graphqlPubsub,
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
  let link = doc.link;

  // remove duplicated ids
  const receiverIds = [...new Set(receivers)];

  // collecting emails
  const recipients = await models.Users.find({
    _id: { $in: receiverIds },
    isActive: true,
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

  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  link = `${MAIN_APP_DOMAIN}${link}`;

  // for controlling email template data filling
  const modifier = (data: any, email: string) => {
    const user = recipients.find((item) => item.email === email);

    if (user) {
      data.uid = user._id;
    }
  };

  await sendEmail(models, memoryStorage, {
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
    modifier,
  });

  return true;
};

/**
 * Send notification to mobile device from inbox conversations
 * @param {string} - title
 * @param {string} - body
 * @param {string} - customerId
 * @param {array} - receivers
 */
export const sendMobileNotification = async (
  models,
  {
    receivers,
    title,
    body,
    customerId,
    conversationId,
  }: {
    receivers: string[];
    customerId?: string;
    title: string;
    body: string;
    conversationId?: string;
  }
): Promise<void> => {
  if (!admin.apps.length) {
    await initFirebase(models);
  }

  const transporter = admin.messaging();
  const tokens: string[] = [];

  if (receivers) {
    tokens.push(
      ...(await models.Users.find({ _id: { $in: receivers } }).distinct(
        'deviceTokens'
      ))
    );
  }

  if (customerId) {
    tokens.push(
      ...(await models.Customers.findOne({ _id: customerId }).distinct(
        'deviceTokens'
      ))
    );
  }

  if (tokens.length > 0) {
    // send notification
    for (const token of tokens) {
      try {
        await transporter.send({
          token,
          notification: { title, body },
          data: { conversationId: conversationId || '' },
        });
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};

export const sendToWebhook = async (
  models: any,
  { action, type, params }: { action: string; type: string; params: any }
) => {
  const webhooks = await models.Webhooks.find({
    actions: { $elemMatch: { action, type } },
  });

  if (!webhooks) {
    return;
  }

  let data = params;

  for (const webhook of webhooks) {
    if (!webhook.url || webhook.url.length === 0) {
      continue;
    }

    if (action === 'delete') {
      data = { type, object: { _id: params.object._id } };
    }

    const { slackContent, content, url } = await prepareWebhookContent(
      models,
      type,
      action,
      data
    );

    sendRequest({
      url: webhook.url,
      headers: {
        'Erxes-token': webhook.token || '',
      },
      method: 'post',
      body: {
        data: JSON.stringify(data),
        text: slackContent,
        content,
        url,
        action,
        type,
      },
    })
      .then(async () => {
        await models.Webhooks.updateStatus(webhook._id, 'available');
      })
      .catch(async () => {
        await models.Webhooks.updateStatus(webhook._id, 'unavailable');
      });
  }
};

const prepareWebhookContent = async (models, type, action, data) => {
  let actionText = 'created';
  let url;
  let content = '';

  switch (action) {
    case 'update':
      actionText = 'has been updated';
      break;
    case 'delete':
      actionText = 'has been deleted';
      break;
    case 'createBoardItemMovementLog':
      content = `${type} with name ${data.data.item.name ||
        ''} has moved from ${data.data.activityLogContent.text}`;
      url = data.data.link;
    default:
      actionText = 'has been created';
      break;
  }

  switch (type) {
    case WEBHOOK_TYPES.CUSTOMER:
      url = `/contacts/details/${data.object._id}`;
      content = `Customer ${actionText}`;
      break;

    case WEBHOOK_TYPES.COMPANY:
      url = `/companies/details/${data.object._id}`;
      content = `Company ${actionText}`;
      break;

    case WEBHOOK_TYPES.KNOWLEDGEBASE:
      url = `/knowledgeBase?id=${data.newData.categoryIds[0]}`;
      content = `Knowledge base article ${actionText}`;
      break;

    case WEBHOOK_TYPES.USER_MESSAGES:
      url = `/inbox/index?_id=${data.conversationId}`;
      content = 'Admin has replied to a conversation';
      break;

    case WEBHOOK_TYPES.CUSTOMER_MESSAGES:
      url = `/inbox/index?_id=${data.conversationId}`;
      content = 'Customer has send a conversation message';
      break;

    case WEBHOOK_TYPES.CONVERSATION:
      url = `/inbox/index?_id=${data._id}`;
      content = 'Customer has started new conversation';
      break;

    case WEBHOOK_TYPES.FORM_SUBMITTED:
      url = `/inbox/index?_id=${data.conversationId}`;
      content = 'Customer has submitted a form';
      break;

    case WEBHOOK_TYPES.CAMPAIGN:
      url = `/campaigns/show/${data._id}`;

      if (data.method === 'messenger') {
        url = `/campaigns/edit/${data.$_id}`;
      }

      content = 'Campaign has been created';
      break;

    default:
      content = `${type} ${actionText}`;
      url = '';
      break;
  }

  if (
    [WEBHOOK_TYPES.DEAL, WEBHOOK_TYPES.TASK, WEBHOOK_TYPES.TICKET].includes(
      type
    ) &&
    ['create', 'update'].includes(action)
  ) {
    const { object } = data;
    url = await getBoardItemLink(models, object.stageId, object._id);
    content = `${type} ${actionText}`;
  }

  url = `${getEnv({ name: 'MAIN_APP_DOMAIN' })}${url}`;

  let slackContent = '';

  if (action !== 'delete') {
    slackContent = `<${url}|${content}>`;
  }

  return { slackContent, content, url };
};

export const getBoardItemLink = async (
  models: any,
  stageId: string,
  itemId: string
) => {
  const stage = await models.Stages.getStage(stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
  const board = await models.Boards.getBoard(pipeline.boardId);

  return `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${itemId}`;
};
