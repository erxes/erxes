import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as queryString from 'querystring';
import * as request from 'request-promise';
import { debugTwitter } from '../debuggers';
import { IAccount } from '../models/Accounts';
import { getEnv } from '../utils';

interface ITwitterConfig {
  oauth: {
    consumer_key: string;
    consumer_secret: string;
    token: string;
    token_secret: string;
  };
  twitterBearerToken?: string;
  twitterWebhookEnvironment: string;
}

dotenv.config();

export const twitterConfig: ITwitterConfig = {
  oauth: {
    consumer_key: getEnv({ name: 'TWITTER_CONSUMER_KEY' }),
    consumer_secret: getEnv({ name: 'TWITTER_CONSUMER_SECRET' }),
    token: getEnv({ name: 'TWITTER_ACCESS_TOKEN' }),
    token_secret: getEnv({ name: 'TWITTER_ACCESS_TOKEN_SECRET' }),
  },
  twitterWebhookEnvironment: getEnv({ name: 'TWITTER_WEBHOOK_ENV' }),
};

export const getTwitterAuthUrl = (): Promise<{
  responseParams: queryString.ParsedUrlQuery;
  twitterAuthUrl: string;
}> => {
  // construct request to retrieve authorization token
  const requestOptions = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    oauth: {
      callback: `${getEnv({ name: 'DOMAIN' })}/twitter/callback/add`,
      consumer_key: twitterConfig.oauth.consumer_key,
      consumer_secret: twitterConfig.oauth.consumer_secret,
    },
  };

  return new Promise((resolve, reject) => {
    request
      .post(requestOptions)
      .then(response => {
        // construct sign-in URL from returned authorization token
        const responseParams = queryString.parse(response);

        const twitterAuthUrl =
          'https://api.twitter.com/oauth/authenticate?force_login=true&oauth_token=' + responseParams.oauth_token;

        resolve({
          responseParams,
          twitterAuthUrl,
        });
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getTwitterBearerToken = () => {
  // just return the bearer token if we already have one
  if (twitterConfig.twitterBearerToken) {
    return new Promise((resolve, _reject) => {
      resolve(twitterConfig.twitterBearerToken);
    });
  }

  // construct request for bearer token
  const requestOptions = {
    url: 'https://api.twitter.com/oauth2/token',
    method: 'POST',
    auth: {
      user: twitterConfig.oauth.consumer_key,
      pass: twitterConfig.oauth.consumer_secret,
    },
    form: {
      grant_type: 'client_credentials',
    },
  };

  return new Promise((resolve, reject) => {
    request(requestOptions, (error, response) => {
      if (error) {
        reject(error);
      } else {
        const jsonBody = JSON.parse(response.body);

        twitterConfig.twitterBearerToken = jsonBody.access_token;

        resolve(twitterConfig.twitterBearerToken);
      }
    });
  });
};

export const getChallengeResponse = (crcToken, consumerSecret) => {
  return crypto
    .createHmac('sha256', consumerSecret)
    .update(crcToken)
    .digest('base64');
};

export const registerWebhook = async () => {
  return new Promise(async (resolve, reject) => {
    const webhooks = await retreiveWebhooks().catch(e => {
      debugTwitter('Could not retreive webhooks', e.message);
    });
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const webhookObj = webhooks && webhooks.find(webhook => webhook.url === `${DOMAIN}/twitter/webhook`);

    if (webhookObj) {
      debugTwitter('Webhook already exists');
      return;
    }

    const requestOptions = {
      url:
        'https://api.twitter.com/1.1/account_activity/all/' +
        twitterConfig.twitterWebhookEnvironment +
        '/webhooks.json',
      oauth: twitterConfig.oauth,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        url: `${DOMAIN}/twitter/webhook`,
      },
    };

    for (const webhook of webhooks || []) {
      await deleteWebhook(webhook.id).catch(e => {
        debugTwitter('Could not retreive webhooks', e.message);
      });
    }

    debugTwitter('Registering webhook');

    request
      .post(requestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(er => {
        debugTwitter(er.message);
        reject(er.message);
      });
  });
};

interface IWebhook {
  id: string;
  url: string;
  valid: boolean;
  created_timestamp: string;
  update_webhook_url: string;
}

export const retreiveWebhooks = (): Promise<IWebhook[]> => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url:
        'https://api.twitter.com/1.1/account_activity/all/' +
        twitterConfig.twitterWebhookEnvironment +
        '/webhooks.json',
      oauth: twitterConfig.oauth,
    };

    request
      .get(requestOptions)
      .then(body => {
        resolve(JSON.parse(body));
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const deleteWebhook = webhookId => {
  return new Promise((resolve, reject) => {
    // if no webhook id provided, assume there is none to delete
    if (!webhookId) {
      resolve();
      return;
    }

    // construct request to delete webhook config
    const requestOptions = {
      url:
        'https://api.twitter.com/1.1/account_activity/all/' +
        twitterConfig.twitterWebhookEnvironment +
        '/webhooks/' +
        webhookId +
        '.json',
      oauth: twitterConfig.oauth,
      resolveWithFullResponse: true,
    };

    request
      .delete(requestOptions)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

export const unsubscribe = (userId: string) => {
  return new Promise(async (resolve, reject) => {
    const bearer = await getTwitterBearerToken();
    const requestOptions = {
      url: `https://api.twitter.com/1.1/account_activity/all/${twitterConfig.twitterWebhookEnvironment}/subscriptions/${userId}.json`,
      auth: {
        bearer,
      },
    };

    request
      .delete(requestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const subscribeToWebhook = (account: IAccount) => {
  return new Promise((resolve, reject) => {
    const subRequestOptions = {
      url:
        'https://api.twitter.com/1.1/account_activity/all/' +
        twitterConfig.twitterWebhookEnvironment +
        '/subscriptions.json',
      oauth: twitterConfig.oauth,
      resolveWithFullResponse: true,
    };

    subRequestOptions.oauth.token = account.token;
    subRequestOptions.oauth.token_secret = account.tokenSecret;

    request
      .post(subRequestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const removeFromWebhook = (account: IAccount) => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url:
        'https://api.twitter.com/1.1/account_activity/all/' +
        twitterConfig.twitterWebhookEnvironment +
        '/subscriptions.json',
      oauth: twitterConfig.oauth,
    };

    requestOptions.oauth.token = account.token;
    requestOptions.oauth.token_secret = account.tokenSecret;

    request
      .delete(requestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

interface IMessage {
  event: {
    type: string;
    id: string;
    created_timestamp: string;
    message_create: {
      message_data: {
        text: string;
      };
    };
  };
}

export const reply = (receiverId: string, content: string, attachment, account: IAccount): Promise<IMessage> => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
      oauth: twitterConfig.oauth,
      body: {
        event: {
          type: 'message_create',
          message_create: {
            target: {
              recipient_id: receiverId,
            },
            message_data: {
              text: content,
              attachment: attachment.media.id ? attachment : null,
            },
          },
        },
      },
      json: true,
    };

    requestOptions.oauth.token = account.token;
    requestOptions.oauth.token_secret = account.tokenSecret;

    request
      .post(requestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const upload = base64 => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: 'https://upload.twitter.com/1.1/media/upload.json',
      oauth: twitterConfig.oauth,
      form: {
        media_data: base64,
      },
    };

    request
      .post(requestOptions)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const downloadImageFromApi = imageId => {
  return new Promise(async (resolve, reject) => {
    const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });
    const url = `${MAIN_API_DOMAIN}/read-file?key=${imageId}`;

    const options = {
      url,
      encoding: null,
    };

    try {
      await request.get(options).then(res => {
        const buffer = Buffer.from(res, 'utf8');

        resolve(buffer.toString('base64'));
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const veriyfyLoginToken = (
  oauthToken,
  oauthVerifier,
): Promise<{ oauth_token: string; oauth_token_secret: string; user_id: string; screen_name: string }> => {
  return new Promise((resolve, reject) => {
    const requestOptions: any = {
      url: 'https://api.twitter.com/oauth/access_token',
      oauth: twitterConfig.oauth,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      form: {
        oauth_verifier: oauthVerifier,
      },
    };

    requestOptions.oauth.token = oauthToken;

    request
      .post(requestOptions)
      .then(res => {
        const responseParams: any = queryString.parse(res);

        resolve({ ...responseParams });
      })
      .catch(e => {
        reject(e);
      });
  });
};

export const verifyUser = (
  token,
  tokenSecret,
): Promise<{ id: string; username: string; name: string; screen_name: string; id_str: string }> => {
  return new Promise((resolve, reject) => {
    const requestOptions: any = {
      url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
      oauth: twitterConfig.oauth,
    };

    requestOptions.oauth.token = token;
    requestOptions.oauth.token_secret = tokenSecret;

    request
      .get(requestOptions)
      .then(res => {
        resolve(JSON.parse(res));
      })
      .catch(e => {
        reject(e);
      });
  });
};
