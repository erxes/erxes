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

import { EMAIL_CONTENT_PLACEHOLDER } from './constants';
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

export const send = message => {
  const { fromUserId, segmentId, customerIds } = message;
  const { templateId, subject, content } = message.email;

  const user = Meteor.users.findOne(fromUserId);
  const userEmail = user.emails.pop();
  const template = EmailTemplates.findOne(templateId);

  // find matched customers
  let customerQuery = { _id: { $in: customerIds || [] } };

  if (segmentId) {
    customerQuery = customerQueryBuilder.segments(Segments.findOne(segmentId));
  }

  const customers = Customers.find(customerQuery).fetch();

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
