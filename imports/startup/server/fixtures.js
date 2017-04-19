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

  const { user, brand, integration, channel } = Meteor.settings.initialData;

  const userId = Accounts.createUser(user);
  const brandId = Brands.insert(Object.assign({ userId }, brand));
  const integrationId = Integrations.insert(Object.assign({ brandId }, integration));
  Channels.insert(
    Object.assign(
      {
        userId,
        memberIds: [userId],
        integrationIds: [integrationId],
      },
      channel,
    ),
  );
});
