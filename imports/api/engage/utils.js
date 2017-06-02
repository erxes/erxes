import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import customerQueryBuilder from '/imports/api/customers/queryBuilder';
import Segments from '/imports/api/customers/segments';
import { Customers } from '/imports/api/customers/customers';

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

export const send = ({ fromUserId, segmentId, subject, content }) => {
  const segment = Segments.findOne({ _id: segmentId });
  const user = Meteor.users.findOne({ _id: fromUserId });

  // find matched customers
  const customers = Customers.find(customerQueryBuilder.segments(segment));

  customers.forEach(customer => {
    const replacedSubject = replaceKeys({ content: subject, customer, user });
    const replacedContent = replaceKeys({ content, customer, user });

    const userEmail = user.emails.pop();

    // send email
    Email.send({
      from: userEmail.address,
      to: customer.email,
      subject: replacedSubject,
      html: replacedContent,
    });
  });
};
