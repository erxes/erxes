import soc from 'social-oauth-client';
import { Meteor } from 'meteor/meteor';

const socTwitter = new soc.Twitter({
  CONSUMER_KEY: Meteor.settings.TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: Meteor.settings.TWITTER_CONSUMER_SECRET,
  REDIRECT_URL: Meteor.settings.TWITTER_REDIRECT_URL,
});

export const twitter = {
  soc: socTwitter,

  authenticate: (queryParams, callback) => {
    // after user clicked authenticate button
    socTwitter.callback({ query: queryParams }).then(
      Meteor.bindEnvironment((data) => {
        // return integration info
        callback({
          name: data.info.name,
          twitterData: {
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
