import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, doc) => {
  if (Meteor.users.find().count() > 0 && !options.invite) {
    throw new Meteor.Error(403, 'Can not register');
  }

  const user = _.extend({ details: options.details || {} }, doc);

  if (Meteor.users.find().count() === 0) {
    user.isOwner = true;
  }

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
