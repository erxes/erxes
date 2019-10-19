import * as graph from 'fbgraph';
import { debugFacebook } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { IAttachment, IAttachmentMessage } from './types';

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);
    graph.setVersion('3.2');

    return new Promise((resolve, reject) => {
      graph[method](path, ...otherParams, (error, response) => {
        if (error) {
          return reject(error);
        }
        return resolve(response);
      });
    });
  },
  get(...args): any {
    return this.base('get', ...args);
  },

  post(...args): any {
    return this.base('post', ...args);
  },

  delete(...args): any {
    return this.base('del', ...args);
  },
};

export const getPageList = async (accessToken?: string) => {
  const response: any = await graphRequest.get('/me/accounts?limit=100', accessToken);

  return response.data.map(page => ({
    id: page.id,
    name: page.name,
  }));
};

export const getPageAccessToken = async (pageId: string, userAccessToken: string) => {
  const response = await graphRequest.get(`${pageId}/?fields=access_token`, userAccessToken);

  return response.access_token;
};

export const getPageAccessTokenFromMap = (pageId: string, pageTokens: { [key: string]: string }): string => {
  return (pageTokens || {})[pageId] || null;
};

export const subscribePage = async (pageId, pageToken): Promise<{ success: true } | any> => {
  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields: ['conversations', 'messages', 'feed'],
  });
};

export const unsubscribePage = async (pageId, pageToken): Promise<{ success: true } | any> => {
  return graphRequest
    .delete(`${pageId}/subscribed_apps`, pageToken)
    .then(res => res)
    .catch(e => debugFacebook(e));
};

export const getFacebookUser = async (pageId: string, fbUserId: string, userAccessToken: string) => {
  let pageAccessToken;

  try {
    pageAccessToken = await getPageAccessToken(pageId, userAccessToken);
  } catch (e) {
    debugFacebook(`Error ocurred while trying to get page access token with ${e.message}`);
  }

  const pageToken = pageAccessToken;

  return await graphRequest.get(`/${fbUserId}`, pageToken);
};

export const getFacebookUserProfilePic = async (fbId: string) => {
  try {
    const response: any = await graphRequest.get(`/${fbId}/picture?height=600`);
    return response.image ? response.location : '';
  } catch (e) {
    return null;
  }
};

export const restorePost = async (postId: string, pageId: string, userAccessToken: string) => {
  let pageAccessToken;

  try {
    pageAccessToken = await getPageAccessToken(pageId, userAccessToken);
  } catch (e) {
    debugFacebook(`Error ocurred while trying to get page access token with ${e.message}`);
  }

  const fields = `/${postId}?fields=caption,description,link,picture,source,message,from,created_time,comments.summary(true)`;
  return graphRequest.get(fields, pageAccessToken);
};

export const sendReply = async (url: string, data: any, recipientId: string, integrationId: string) => {
  const integration = await Integrations.getIntegration({ erxesApiId: integrationId });

  const account = await Accounts.getAccount({ _id: integration.accountId });

  const { facebookPageTokensMap } = integration;

  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(recipientId, facebookPageTokensMap);
  } catch (e) {
    debugFacebook(`Error ocurred while trying to get page access token with ${e.message}`);
    return e;
  }

  try {
    const response = await graphRequest.post(`${url}`, pageAccessToken, {
      ...data,
    });
    debugFacebook(`Successfully sent data to facebook ${JSON.stringify(data)}`);
    return response;
  } catch (e) {
    debugFacebook(`Error ocurred while trying to send post request to facebook ${e} data: ${JSON.stringify(data)}`);
    if (e.message.includes('Invalid OAuth')) {
      // Update expired token for selected page
      const newPageAccessToken = await getPageAccessToken(recipientId, account.token);

      facebookPageTokensMap[recipientId] = newPageAccessToken;

      await integration.updateOne({ facebookPageTokensMap });
    }

    throw new Error(e.message);
  }
};

export const generateAttachmentMessages = (attachments: IAttachment[]) => {
  const messages: IAttachmentMessage[] = [];

  for (const attachment of attachments || []) {
    let type = 'file';

    if (attachment.type.startsWith('image')) {
      type = 'image';
    }

    messages.push({
      attachment: {
        type,
        payload: {
          url: attachment.url,
        },
      },
    });
  }

  return messages;
};
