import * as Random from 'meteor-random';
import {
  ConversationMessages,
  Conversations,
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Users,
} from '../../../db/models';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { IEngageMessageDocument } from '../../../db/models/definitions/engages';
import { IUserDocument } from '../../../db/models/definitions/users';
import { INTEGRATION_KIND_CHOICES, MESSAGE_KINDS, METHODS } from '../../constants';
import QueryBuilder from '../../modules/segments/queryBuilder';
import { createTransporter, getEnv } from '../../utils';

/**
 * Dynamic content tags
 */
export const replaceKeys = ({
  content,
  customer,
  user,
}: {
  content: string;
  customer: ICustomerDocument;
  user: IUserDocument;
}): string => {
  let result = content;

  const customerName = `${customer.firstName} + ${customer.lastName}`;
  const details = user.details ? user.details.toJSON() : {};

  // replace customer fields
  result = result.replace(/{{\s?customer.name\s?}}/gi, customerName);
  result = result.replace(/{{\s?customer.email\s?}}/gi, customer.primaryEmail || '');

  // replace user fields
  result = result.replace(/{{\s?user.fullName\s?}}/gi, details.fullName || '');
  result = result.replace(/{{\s?user.position\s?}}/gi, details.position || '');
  result = result.replace(/{{\s?user.email\s?}}/gi, user.email || '');

  return result;
};

/**
 * Find customers
 */
const findCustomers = async ({
  customerIds,
  segmentIds = [],
  tagIds = [],
  brandIds = [],
}: {
  customerIds: string[];
  segmentIds?: string[];
  tagIds?: string[];
  brandIds?: string[];
}): Promise<ICustomerDocument[]> => {
  // find matched customers
  let customerQuery: any = { _id: { $in: customerIds || [] } };
  const doNotDisturbQuery = [{ doNotDisturb: 'No' }, { doNotDisturb: { $exists: false } }];

  if (tagIds.length > 0) {
    customerQuery = { $or: doNotDisturbQuery, tagIds: { $in: tagIds || [] } };
  }

  if (brandIds.length > 0) {
    const integrationIds = await Integrations.find({ brandId: { $in: brandIds } }).distinct('_id');

    customerQuery = { $or: doNotDisturbQuery, integrationId: { $in: integrationIds } };
  }

  if (segmentIds.length > 0) {
    const segmentQueries: any = [];

    const segments = await Segments.find({ _id: { $in: segmentIds } });

    for (const segment of segments) {
      const filter = await QueryBuilder.segments(segment);

      filter.$or = doNotDisturbQuery;

      segmentQueries.push(filter);
    }

    customerQuery = { $or: segmentQueries };
  }

  return Customers.find(customerQuery);
};

const executeSendViaEmail = async (
  userEmail: string,
  attachments: any,
  customer: ICustomerDocument,
  replacedSubject: string,
  replacedContent: string,
  AWS_SES_CONFIG_SET: string,
  messageId: string,
  mailMessageId: string,
) => {
  const transporter = await createTransporter({ ses: true });
  let mailAttachment = [];

  if (attachments.length > 0) {
    mailAttachment = attachments.map(file => {
      return {
        filename: file.name || '',
        path: file.url || '',
      };
    });
  }

  transporter.sendMail({
    from: userEmail,
    to: customer.primaryEmail,
    subject: replacedSubject,
    attachments: mailAttachment,
    html: replacedContent,
    headers: {
      'X-SES-CONFIGURATION-SET': AWS_SES_CONFIG_SET,
      EngageMessageId: messageId,
      CustomerId: customer._id,
      MailMessageId: mailMessageId,
    },
  });
};
/**
 * Send via email
 */
const sendViaEmail = async (message: IEngageMessageDocument) => {
  const { fromUserId, tagIds, brandIds, segmentIds, customerIds = [] } = message;

  if (!message.email) {
    return;
  }

  const { subject, content, attachments = [] } = message.email.toJSON();

  const AWS_SES_CONFIG_SET = getEnv({ name: 'AWS_SES_CONFIG_SET' });
  const AWS_ENDPOINT = getEnv({ name: 'AWS_ENDPOINT' });

  const user = await Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  const userEmail = user.email;
  if (!userEmail) {
    throw new Error(`email not found with ${userEmail}`);
  }

  // find matched customers
  const customers = await findCustomers({ customerIds, segmentIds, tagIds, brandIds });

  // save matched customer ids
  EngageMessages.setCustomerIds(message._id, customers);

  for (const customer of customers) {
    let replacedContent = content;

    // Add unsubscribe link ========
    const unSubscribeUrl = `${AWS_ENDPOINT}/unsubscribe/?cid=${customer._id}`;

    replacedContent += `<div style="padding: 10px; color: #ccc; text-align: center; font-size:12px;">If you want to use service like this click <a style="text-decoration: underline; color: #ccc;" href="https://erxes.io" target="_blank">here</a> to read more. Also you can opt out from our email subscription <a style="text-decoration: underline;color: #ccc;" rel="noopener" target="_blank" href="${unSubscribeUrl}">here</a>.  <br>© 2019 erxes inc Growth Marketing Platform </div>`;

    const mailMessageId = Random.id();

    // add new delivery report
    EngageMessages.addNewDeliveryReport(message._id, mailMessageId, customer._id);

    // send email =========
    utils.executeSendViaEmail(
      userEmail,
      attachments,
      customer,
      subject,
      replacedContent,
      AWS_SES_CONFIG_SET,
      message._id,
      mailMessageId,
    );
  }
};

/**
 * Send via messenger
 */
const sendViaMessenger = async (message: IEngageMessageDocument) => {
  const { fromUserId, tagIds, brandIds, segmentIds, customerIds = [] } = message;

  if (!message.messenger) {
    return;
  }

  const { brandId, content = '' } = message.messenger;

  const user = await Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  // find integration
  const integration = await Integrations.findOne({
    brandId,
    kind: INTEGRATION_KIND_CHOICES.MESSENGER,
  });

  if (integration === null) {
    throw new Error('Integration not found');
  }

  // find matched customers
  const customers = await findCustomers({ customerIds, segmentIds, tagIds, brandIds });

  // save matched customer ids
  EngageMessages.setCustomerIds(message._id, customers);

  for (const customer of customers) {
    // replace keys in content
    const replacedContent = replaceKeys({ content, customer, user });
    // create conversation
    const conversation = await Conversations.createConversation({
      userId: fromUserId,
      customerId: customer._id,
      integrationId: integration._id,
      content: replacedContent,
    });

    // create message
    await ConversationMessages.createMessage({
      engageData: {
        messageId: message._id,
        fromUserId,
        ...message.messenger.toJSON(),
      },
      conversationId: conversation._id,
      userId: fromUserId,
      customerId: customer._id,
      content: replacedContent,
    });
  }
};

/*
 *  Send engage messages
 */
export const send = (message: IEngageMessageDocument) => {
  const { method, kind } = message;

  if (method === METHODS.EMAIL) {
    return sendViaEmail(message);
  }

  // when kind is visitor auto, do not do anything
  if (method === METHODS.MESSENGER && kind !== MESSAGE_KINDS.VISITOR_AUTO) {
    return sendViaMessenger(message);
  }
};

/*
 * Handle engage unsubscribe request
 */
export const handleEngageUnSubscribe = (query: { cid: string }) =>
  Customers.updateOne({ _id: query.cid }, { $set: { doNotDisturb: 'Yes' } });

export const utils = {
  executeSendViaEmail,
};

export default {
  replaceKeys,
  send,
};
