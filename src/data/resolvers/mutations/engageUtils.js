import { EngageMessages, Customers, Users, EmailTemplates, Integrations } from '../../../db/models';
import {
  EMAIL_CONTENT_PLACEHOLDER,
  METHODS,
  MESSAGE_KINDS,
  INTEGRATION_KIND_CHOICES,
} from '../../constants';
import Random from 'meteor-random';

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

  // TODO

  return Customers.find(customerQuery).fetch();
};

const saveMatchedCustomerIds = (messageId, customers) =>
  EngageMessages.update(
    { _id: messageId },
    { $set: { customerIds: customers.map(customer => customer._id) } },
  );

const sendViaEmail = message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { templateId, subject, content } = message.email;

  const user = Users.findOne(fromUserId);
  const userEmail = user.emails.pop();
  const template = EmailTemplates.findOne(templateId);

  // find matched customers
  const customers = findCustomers({ customerIds, segmentId });

  // save matched customer ids
  saveMatchedCustomerIds(message._id, customers);

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
    EngageMessages.update(
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

    // TODO send email
  });
};

const sendViaMessenger = message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { brandId, content } = message.messenger;

  const user = Users.findOne(fromUserId);

  // find integration
  const integration = Integrations.findOne({
    brandId,
    kind: INTEGRATION_KIND_CHOICES.MESSENGER,
  });

  if (!integration) {
    return 'Integration not found';
  }

  // find matched customers
  const customers = findCustomers({ customerIds, segmentId });

  // save matched customer ids
  saveMatchedCustomerIds(message._id, customers);

  // TODO
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
