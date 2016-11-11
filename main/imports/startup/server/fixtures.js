import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Brands } from '/imports/api/brands/brands';
import { Channels } from '/imports/api/channels/channels';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (Meteor.users.find().count() !== 0) {
    return;
  }

  const userId = Accounts.createUser({
    username: 'admin',
    email: 'admin@erxes.io',
    password: 'admin123',
    fullName: 'Erxes Admin',
  });

  if (Channels.find().count() === 0) {
    Channels.insert({
      userId,
      memberIds: [userId],
      name: 'Sales',
    });
  }

  if (Brands.find().count() === 0) {
    Brands.insert({
      userId,
      name: 'Local publisher',
      code: 'YDEdKj',
    });
  }
});
