import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';

import customerQueryBuilder from '/imports/api/customers/queryBuilder';
import Segments from '/imports/api/customers/segments';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import { Customers } from '/imports/api/customers/customers';

import { EMAIL_CONTENT_PLACEHOLDER } from './constants';

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
  const { fromUserId, segmentId } = message;
  const { templateId, subject, content } = message.email;

  const user = Meteor.users.findOne(fromUserId);
  const userEmail = user.emails.pop();
  const segment = Segments.findOne(segmentId);
  const template = EmailTemplates.findOne(templateId);

  // find matched customers
  const customers = Customers.find(customerQueryBuilder.segments(segment));

  // initiate transporter
  const { service, auth } = Meteor.settings.mail || {};

  customers.forEach(customer => {
    // replace keys in subject
    const replacedSubject = replaceKeys({ content: subject, customer, user });

    // replace keys such as {{ customer.name }} in content
    let replacedContent = replaceKeys({ content, customer, user });

    // if sender choosed some template then use it
    if (template) {
      replacedContent = template.content.replace(EMAIL_CONTENT_PLACEHOLDER, replacedContent);
    }

    // send email
    Email.send(
      {
        from: userEmail.address,
        to: customer.email,
        subject: replacedSubject,
        html: replacedContent,
      },
      (error, info) => {
        console.log(error); // eslint-disable-line
        console.log(info); // eslint-disable-line
      },
    );
  });
};
