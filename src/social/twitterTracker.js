import Twit from 'twit';
import { OAuth } from 'oauth';
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
const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  '1.0A',
  TWITTER_REDIRECT_URL,
  'HMAC-SHA1',
);

/*
 * Get access token using oauth_token, oauth_verifier
 */
const getAccessToken = ({ oauth_token, oauth_verifier }) =>
  new Promise((resolve, reject) =>
    oauth.getOAuthAccessToken(
      oauth_token,
      '',
      oauth_verifier,
      (e, accessToken, accessTokenSecret) => {
        if (e) {
          return reject(e.message);
        }

        return resolve({ accessToken, accessTokenSecret });
      },
    ),
  );

/*
 * Get access token using oauth_token and get user info using access token
 */
const authenticate = async queryParams => {
  // get access token
  const { accessToken, accessTokenSecret } = await getAccessToken(queryParams);

  // get account info
  const response = await new Promise((resolve, reject) =>
    oauth.get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      accessToken,
      accessTokenSecret,
      (e, response) => {
        if (e) {
          return reject(e.message);
        }

        return resolve(JSON.parse(response));
      },
    ),
  );

  return {
    info: response,
    tokens: {
      auth: {
        token: accessToken,
        token_secret: accessTokenSecret,
      },
    },
  };
};

/*
 * Generate twitter authentication url
 */
const getTwitterAuthorizeUrl = () =>
  new Promise((resolve, reject) =>
    oauth.getOAuthRequestToken((e, oauth_token) => {
      if (e) {
        return reject(e.message);
      }

      return resolve(`https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`);
    }),
  );

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
  getTwitterAuthorizeUrl,
};
