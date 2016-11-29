import soc from 'social-oauth-client';
import { Meteor } from 'meteor/meteor';

// twitter ===============
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

// facebook ===============
const socFacebook = new soc.Facebook({
  APP_ID: Meteor.settings.FACEBOOK_APP_ID,
  APP_SECRET: Meteor.settings.FACEBOOK_APP_SECRET,
  CLIENT_ID: Meteor.settings.FACEBOOK_CLIENT_ID,
  REDIRECT_URL: Meteor.settings.FACEBOOK_REDIRECT_URL,
});

export const facebook = {
  soc: socFacebook,

  authenticate: (queryParams, callback) => {
    // after user clicked authenticate button
    socFacebook.callback({ query: queryParams }).then(
      Meteor.bindEnvironment((data) => {
        const tokens = data.tokens;
        const info = data.info;

        // return integration info
        callback({
          name: info.name,
          facebookData: {
            accessToken: tokens.access_token,
            tokenType: tokens.token_type,
            expiresIn: tokens.expires_in,
            info: {
              id: info.id,
              name: info.name,
              email: info.email,
            },
          },
        });
      })
    );
  },
};

Meteor.methods({
  'integrations.getTwitterAuthorizeUrl': () => socTwitter.getAuthorizeUrl(),
  'integrations.getFacebookAuthorizeUrl': () => socFacebook.getAuthorizeUrl(),
});
