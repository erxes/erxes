import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

// node4mailer is a small modification to nodemailer to run on Node 4 (and higher),
// whereas official Nodemailer runs only on Node 6 (and higher).
// after meteor supports node6, we need to change this
import nodemailer from 'node4mailer';

import customerQueryBuilder from '/imports/api/customers/queryBuilder';
import Segments from '/imports/api/customers/segments';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { createConversation, createMessage } from '/imports/api/conversations/utils';

import { EMAIL_CONTENT_PLACEHOLDER, METHODS, MESSAGE_KINDS } from './constants';
import { Messages } from './engage';

export const replaceKeys = ({ content, customer, user }) => {
  let result = content;

  // replace customer fields
  result = result.replace(/{{\s?customer.name\s?}}/gi, customer.name);
  result = result.replace(/{{\s?customer.email\s?}}/gi, customer.email);

  // replace user fields
  result = result.replace(/{{\s?user.fullName\s?}}/gi, user.fullName);
  result = result.replace(/{{\s?user.position\s?}}/gi, user.position);
  result = result.replace(/{{\s?user.email\s?}}/gi, user.email);

  return result;
};

const findCustomers = ({ customerIds, segmentId }) => {
  // find matched customers
  let customerQuery = { _id: { $in: customerIds || [] } };

  if (segmentId) {
    customerQuery = customerQueryBuilder.segments(Segments.findOne(segmentId));
  }

  return Customers.find(customerQuery).fetch();
};

const saveMatchedCustomerIds = (messageId, customers) =>
  Messages.update(
    { _id: messageId },
    { $set: { customerIds: customers.map(customer => customer._id) } },
  );

const sendViaEmail = message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { templateId, subject, content } = message.email;

  const user = Meteor.users.findOne(fromUserId);
  const userEmail = user.emails.pop();
  const template = EmailTemplates.findOne(templateId);

  // find matched customers
  const customers = findCustomers({ customerIds, segmentId });

  // save matched customer ids
  saveMatchedCustomerIds(message._id, customers);

  // create reusable transporter object using the default SMTP transport
  const { host, port, secure, auth } = Meteor.settings.mail || {};

  const transporter = nodemailer.createTransport({ host, port, secure, auth });

  customers.forEach(customer => {
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
    Messages.update(
      { _id: message._id },
      {
        $set: {
          [`deliveryReports.${mailMessageId}`]: {
            customerId: customer._id,
            status: 'pending',
          },
        },
      },
    );

    // send email
    transporter.sendMail(
      {
        from: userEmail.address,
        to: customer.email,
        subject: replacedSubject,
        html: replacedContent,
        messageId: mailMessageId,
      },
      Meteor.bindEnvironment((error, info) => {
        // set new status
        const status = error ? 'failed' : 'sent';

        // update status
        Messages.update(
          { _id: message._id },
          {
            $set: {
              [`deliveryReports.${info.messageId}.status`]: status,
            },
          },
        );
      }),
    );
  });
};

const sendViaMessenger = message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { brandId, content } = message.messenger;

  const user = Meteor.users.findOne(fromUserId);

  // find integration
  const integration = Integrations.findOne({
    brandId,
    kind: KIND_CHOICES.MESSENGER,
  });

  if (!integration) {
    return 'Integration not found';
  }

  // find matched customers
  const customers = findCustomers({ customerIds, segmentId });

  // save matched customer ids
  saveMatchedCustomerIds(message._id, customers);

  customers.forEach(customer => {
    const messageId = Random.id();

    // add new delivery report
    Messages.update(
      { _id: message._id },
      {
        $set: {
          [`deliveryReports.${messageId}`]: {
            customerId: customer._id,
            status: 'pending',
          },
        },
      },
    );

    // replace keys in content
    const replacedContent = replaceKeys({ content, customer, user });

    // create conversation
    const conversationId = createConversation({
      customerId: customer._id,
      integrationId: integration._id,
      content: replacedContent,
    });

    // create message
    createMessage({
      engageData: {
        fromUserId,
        ...message.messenger,
      },
      conversationId,
      userId: fromUserId,
      customerId: customer._id,
      content: replacedContent,
    });
  });
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
