import soc from 'social-oauth-client';
import { Meteor } from 'meteor/meteor';

import './oauth';
import './routes';
import './streams';

export const twitterOAuth = new soc.Twitter({
  CONSUMER_KEY: Meteor.settings.TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: Meteor.settings.TWITTER_CONSUMER_SECRET,
  REDIRECT_URL: 'http://localhost:7010/service/oauth/twitter_callback',
});
