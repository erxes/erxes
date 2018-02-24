import Twit from 'twit';
import soc from 'social-oauth-client';
import { TwitMap, receiveTimeLineResponse, getOrCreateDirectMessageConversation } from './twitter';
import { Integrations } from '../db/models';
import { INTEGRATION_KIND_CHOICES } from '../data/constants';

const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_REDIRECT_URL } = process.env;

const trackIntegration = integration => {
  // Twit instance
  const twit = new Twit({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: integration.twitterData.token,
    access_token_secret: integration.twitterData.tokenSecret,
  });

  // save twit instance
  TwitMap[integration._id] = twit;

  // create stream
  const stream = twit.stream('user');

  // listen for timeline
  stream.on('tweet', data => {
    receiveTimeLineResponse(integration, data);
  });

  // listen for direct messages
  stream.on('direct_message', data => {
    getOrCreateDirectMessageConversation(data.direct_message, integration);
  });
};

// twitter oauth ===============
const socTwitter = new soc.Twitter({
  CONSUMER_KEY: TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: TWITTER_CONSUMER_SECRET,
  REDIRECT_URL: TWITTER_REDIRECT_URL,
});

const authenticate = queryParams => socTwitter.callback({ query: queryParams });

/*
 * Track all twitter integrations for the first time
 */
export const trackIntegrations = () => {
  Integrations.find({ kind: INTEGRATION_KIND_CHOICES.TWITTER }).then(integrations => {
    for (let integration of integrations) {
      trackIntegration(integration);
    }
  });
};

/*
 * Promisify twit post util
 */
export const twitRequest = {
  post(twit, path, data) {
    return new Promise((resolve, reject) => {
      twit.post(path, data, (e, response) => {
        if (e) {
          return reject(e);
        }

        return resolve(response);
      });
    });
  },
};

// doing this to mock authenticate function in test
export const socUtils = {
  authenticate,
  trackIntegration,
  getTwitterAuthorizeUrl: () => socTwitter.getAuthorizeUrl(),
};
