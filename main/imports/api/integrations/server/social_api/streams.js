import { Meteor } from 'meteor/meteor';
import Twit from 'twit';

import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { Conversations } from '/imports/api/conversations/conversations';

export const trackTwitterIntegration = (integration) => {
  // Twit instance
  const twit = new Twit({
    consumer_key: Meteor.settings.TWITTER_CONSUMER_KEY,
    consumer_secret: Meteor.settings.TWITTER_CONSUMER_SECRET,
    access_token: integration.extraData.token,
    access_token_secret: integration.extraData.tokenSecret,
  });

  // create stream
  const stream = twit.stream('user');

  // listen for timeline
  stream.on('tweet', Meteor.bindEnvironment((data) => {
    Conversations.insert({
      content: data.text,
      brandId: integration.brandId,
      customerId: 'Bidda83myZ4QPE2rw',
      status: 'new',
    });
  }));

  // listen for direct messages
  stream.on('direct_message', Meteor.bindEnvironment(() => {}));
};

// track all twitter integrations for the first time
Integrations.find({ kind: KIND_CHOICES.TWITTER }).forEach((integration) => {
  trackTwitterIntegration(integration);
});
