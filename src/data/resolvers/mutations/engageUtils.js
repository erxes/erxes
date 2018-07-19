import {
  EngageMessages,
  Customers,
  Users,
  EmailTemplates,
  Integrations,
  Segments,
  Conversations,
  ConversationMessages,
} from '../../../db/models';
import {
  EMAIL_CONTENT_PLACEHOLDER,
  METHODS,
  MESSAGE_KINDS,
  INTEGRATION_KIND_CHOICES,
} from '../../constants';
import Random from 'meteor-random';
import QueryBuilder from '../queries/segmentQueryBuilder';
import { createTransporter } from '../../utils';

/**
 * Dynamic content tags
 * @param {String} content
 * @param {Object} customer
 * @param {String} customer.name - Customer name
 * @param {String} customer.primaryEmail - Customer email
 * @param {Object} user
 * @param {String} user.fullName - User full name
 * @param {String} user.position - User position
 * @param {String} user.email - User email
 * @return replaced content text
 */
export const replaceKeys = ({ content, customer, user }) => {
  let result = content;

  // replace customer fields
  result = result.replace(/{{\s?customer.name\s?}}/gi, customer.name);
  result = result.replace(/{{\s?customer.primaryEmail\s?}}/gi, customer.primaryEmail);

  // replace user fields
  result = result.replace(/{{\s?user.fullName\s?}}/gi, user.fullName);
  result = result.replace(/{{\s?user.position\s?}}/gi, user.position);
  result = result.replace(/{{\s?user.email\s?}}/gi, user.email);

  return result;
};

/**
 * Find customers
 * @param {[String]} customerIds - Customer ids
 * @param {String} segmentId - Segment id
 * @return {Promise} customers
 */
const findCustomers = async ({ customerIds, segmentId }) => {
  // find matched customers
  let customerQuery = { _id: { $in: customerIds || [] } };

  if (segmentId) {
    const segment = await Segments.findOne({ _id: segmentId });
    customerQuery = QueryBuilder.segments(segment);
  }

  return await Customers.find(customerQuery);
};

/**
 * Send via email
 * @param {Object} engage message object
 */
const sendViaEmail = async message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { templateId, subject, content } = message.email;
  const { AWS_SES_CONFIG_SET } = process.env;

  const user = await Users.findOne({ _id: fromUserId });
  const userEmail = user.email;
  const template = await EmailTemplates.findOne({ _id: templateId });

  // find matched customers
  const customers = await findCustomers({ customerIds, segmentId });

  // save matched customer ids
  EngageMessages.setCustomerIds(message._id, customers);

  for (let customer of customers) {
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

    transporter.sendMail({
      from: userEmail,
      to: customer.primaryEmail,
      subject: replacedSubject,
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
 * @param {Object} engage message object
 */
const sendViaMessenger = async message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { brandId, content } = message.messenger;

  const user = Users.findOne({ _id: fromUserId });

  // find integration
  const integration = await Integrations.findOne({
    brandId,
    kind: INTEGRATION_KIND_CHOICES.MESSENGER,
  });

  if (integration === null) throw new Error('Integration not found');

  // find matched customers
  const customers = await findCustomers({ customerIds, segmentId });

  // save matched customer ids
  EngageMessages.setCustomerIds(message._id, customers);

  for (let customer of customers) {
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
    ConversationMessages.createMessage({
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
