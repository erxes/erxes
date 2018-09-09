import { OAuth } from 'oauth';
import * as Twit from 'twit';
import { INTEGRATION_KIND_CHOICES } from '../data/constants';
import { Integrations } from '../db/models';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
import { receiveDirectMessageInformation, receiveTimelineInformation, TwitMap } from './twitter';

const trackIntegration = (integration: IIntegrationDocument) => {
  const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env;

  if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET) {
    return;
  }

  if (!integration.twitterData) {
    return;
  }

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
    receiveTimelineInformation(integration, data);
  });

  // listen for direct messages
  stream.on('direct_message', data => {
    receiveDirectMessageInformation(data.direct_message, integration);
  });
};

// twitter oauth ===============
const getOauth = () => {
  const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_REDIRECT_URL } = process.env;

  return new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    '1.0A',
    TWITTER_REDIRECT_URL,
    'HMAC-SHA1',
  );
};

/*
 * Get access token using oauth_token, oauth_verifier
 */
const getAccessToken = ({
  oauth_token,
  oauth_verifier,
}: {
  oauth_token: string;
  oauth_verifier: string;
}): Promise<{ accessToken: string; accessTokenSecret: string }> =>
  new Promise((resolve, reject) =>
    getOauth().getOAuthAccessToken(oauth_token, '', oauth_verifier, (e, accessToken, accessTokenSecret) => {
      if (e) {
        return reject(e.message);
      }

      return resolve({ accessToken, accessTokenSecret });
    }),
  );

/*
 * Get access token using oauth_token and get user info using access token
 */
const authenticate = async (queryParams: any) => {
  // get access token
  const { accessToken, accessTokenSecret } = await getAccessToken(queryParams);

  // get account info
  const response = await new Promise((resolve, reject) =>
    getOauth().get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      accessToken,
      accessTokenSecret,
      (e, res) => {
        if (e) {
          return reject(e.message);
        }

        return resolve(JSON.parse(res));
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
    getOauth().getOAuthRequestToken((e, oauthToken) => {
      if (e) {
        return reject(e.message);
      }

      return resolve(`https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`);
    }),
  );

/*
 * Track all twitter integrations for the first time
 */
export const trackIntegrations = () => {
  Integrations.find({ kind: INTEGRATION_KIND_CHOICES.TWITTER }).then(integrations => {
    for (const integration of integrations) {
      trackIntegration(integration);
    }
  });
};

/*
 * Promisify twit post util
 */
export const twitRequest = {
  base(twit, method, path, data) {
    return new Promise((resolve, reject) => {
      twit[method](path, data, (e, response) => {
        if (e) {
          return reject(e);
        }

        return resolve(response);
      });
    });
  },

  post(twit, path, data) {
    return this.base(twit, 'post', path, data);
  },

  get(twit, path, data) {
    return this.base(twit, 'get', path, data);
  },
};

/*
 * Find root tweet using id
 */
export const findParentTweets = async (twit, data, tweets) => {
  if (data.in_reply_to_status_id_str) {
    const parentData = await twitRequest.get(twit, 'statuses/show', {
      id: data.in_reply_to_status_id_str,
    });

    tweets.push(parentData);

    return findParentTweets(twit, { ...parentData }, tweets);
  }

  return tweets;
};

// doing this to mock authenticate function in test
export const socUtils = {
  authenticate,
  trackIntegration,
  findParentTweets,
  getTwitterAuthorizeUrl,
};
