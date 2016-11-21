import soc from 'social-oauth-client';
import { Meteor } from 'meteor/meteor';

const socTwitter = new soc.Twitter({
  CONSUMER_KEY: Meteor.settings.TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: Meteor.settings.TWITTER_CONSUMER_SECRET,
  REDIRECT_URL: 'http://localhost:7010/service/oauth/twitter_callback',
});

export const twitter = {
  soc: socTwitter,
  authenticate: (queryParams, callback) => {
    socTwitter.callback({ query: queryParams }).then(
      Meteor.bindEnvironment((data) => {
        callback({
          name: data.info.name,
          extraData: {
            id: data.info.id,
            token: data.tokens.auth.token,
            tokenSecret: data.tokens.auth.token_secret,
          },
        });
      })
    );
  },
};

Meteor.methods({
  'integrations.getTwitterAuthorizeUrl': () => socTwitter.getAuthorizeUrl(),
});
