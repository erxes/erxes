import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Customers } from '/imports/api/customers/customers';

Accounts.onCreateUser((options, doc) => {
  if (Meteor.users.find().count() > 0 && !options.invite) {
    throw new Meteor.Error(403, 'Can not register');
  }

  const user = Object.assign({ details: options.details || {} }, doc);

  if (Meteor.users.find().count() === 0) {
    user.isOwner = true;
  }

  // For various user specific configurations
  user.configs = {};

  // Save customer fields selection config
  user.configs.customerFields = Customers.getPublicFields();

  return user;
});

/**
 * Validate email address
 */
Accounts.validateNewUser(user => {
  const email = user.emails[0].address;

  if (/^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    return true;
  }

  throw new Meteor.Error('invalid-email', 'Please enter valid email');
});
