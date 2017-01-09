import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Brands } from '/imports/api/brands/brands';
import { Channels } from '/imports/api/channels/channels';
import { Integrations } from '/imports/api/integrations/integrations';

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

  const brandId = Brands.insert({
    userId,
    name: 'Local publisher',
    code: 'YDEdKj',
  });

  const integrationId = Integrations.insert({
    brandId,
    name: 'Local publisher in app messaging',
    kind: 'in_app_messaging',
  });

  Channels.insert({
    userId,
    memberIds: [userId],
    integrationIds: [integrationId],
    name: 'Sales',
  });
});
