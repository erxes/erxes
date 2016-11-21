import { Meteor } from 'meteor/meteor';
import Twit from 'twit';

import { Integrations } from '/imports/api/integrations/integrations';
import { Conversations } from '/imports/api/conversations/conversations';

Integrations.find({ kind: 'twitter' }).forEach((integration) => {
  // Twitter
  const twit = new Twit({
    consumer_key: Meteor.settings.TWITTER_CONSUMER_KEY,
    consumer_secret: Meteor.settings.TWITTER_CONSUMER_SECRET,
    access_token: integration.extraData.token,
    access_token_secret: integration.extraData.tokenSecret,
  });

  const stream = twit.stream('user');

  stream.on('tweet', Meteor.bindEnvironment((data) => {
    Conversations.insert({
      content: data.text,
      brandId: integration.brandId,
      status: 'new',
    });
  }));

  stream.on('direct_message', Meteor.bindEnvironment(() => {}));
});
