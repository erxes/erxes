import * as Random from 'meteor-random';
import {
  ConversationMessages,
  Conversations,
  Customers,
  EmailTemplates,
  EngageMessages,
  Integrations,
  Segments,
  Users,
} from '../../../db/models';
import { ICustomerDocument } from '../../../db/models/definitions/customers';
import { IEngageMessageDocument } from '../../../db/models/definitions/engages';
import { IUserDocument } from '../../../db/models/definitions/users';
import { EMAIL_CONTENT_PLACEHOLDER, INTEGRATION_KIND_CHOICES, MESSAGE_KINDS, METHODS } from '../../constants';
import { createTransporter } from '../../utils';
import QueryBuilder from '../queries/segmentQueryBuilder';

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
  segmentId,
}: {
  customerIds: string[];
  segmentId?: string;
}): Promise<ICustomerDocument[]> => {
  // find matched customers
  let customerQuery: any = { _id: { $in: customerIds || [] } };

  if (segmentId) {
    const segment = await Segments.findOne({ _id: segmentId });
    customerQuery = QueryBuilder.segments(segment);
  }

  return Customers.find(customerQuery);
};

/**
 * Send via email
 */
const sendViaEmail = async (message: IEngageMessageDocument) => {
  const { fromUserId, segmentId, customerIds = [] } = message;

  if (!message.email) {
    return;
  }

  const { templateId, subject, content, attachments = [] } = message.email.toJSON();

  const { AWS_SES_CONFIG_SET } = process.env;

  const user = await Users.findOne({ _id: fromUserId });

  if (!user) {
    throw new Error('User not found');
  }

  const userEmail = user.email;
  const template = await EmailTemplates.findOne({ _id: templateId });

  // find matched customers
  const customers = await findCustomers({ customerIds, segmentId });

  // save matched customer ids
  EngageMessages.setCustomerIds(message._id, customers);

  for (const customer of customers) {
    // replace keys in subject
    const replacedSubject = replaceKeys({ content: subject, customer, user });

    // replace keys such as {{ customer.name }} in content
    let replacedContent = replaceKeys({ content, customer, user });

    // if sender choosed some template then use it
    if (template) {
      replacedContent = template.content.replace(EMAIL_CONTENT_PLACEHOLDER, replacedContent);
    }

    const mailMessageId = Random.id();

    // add new delivery report
    EngageMessages.addNewDeliveryReport(message._id, mailMessageId, customer._id);

    // send email =========
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
        EngageMessageId: message._id,
        MailMessageId: mailMessageId,
      },
    });
  }
};

/**
 * Send via messenger
 */
const sendViaMessenger = async (message: IEngageMessageDocument) => {
  const { fromUserId, segmentId, customerIds = [] } = message;

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
  const customers = await findCustomers({ customerIds, segmentId });

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

export const send = message => {
  const { method, kind } = message;

  if (method === METHODS.EMAIL) {
    return sendViaEmail(message);
  }

  // when kind is visitor auto, do not do anything
  if (method === METHODS.MESSENGER && kind !== MESSAGE_KINDS.VISITOR_AUTO) {
    return sendViaMessenger(message);
  }
};

export default {
  replaceKeys,
  send,
};
