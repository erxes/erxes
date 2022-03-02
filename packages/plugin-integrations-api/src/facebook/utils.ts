import * as graph from 'fbgraph';
import { debugError, debugFacebook } from '../debuggers';
import { Accounts, Integrations } from '../models';
import { IIntegrationDocument } from '../models/Integrations';
import { generateAttachmentUrl } from '../utils';
import { IAttachment, IAttachmentMessage } from './types';

export const graphRequest = {
  base(method: string, path?: any, accessToken?: any, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);
    graph.setVersion('7.0');

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
  }
};

export const getPageList = async (accessToken?: string, kind?: string) => {
  const response: any = await graphRequest.get(
    '/me/accounts?limit=100',
    accessToken
  );

  const pages = [];

  for (const page of response.data) {
    const integration = await Integrations.findOne({
      facebookPageIds: page.id,
      kind
    });

    pages.push({
      id: page.id,
      name: page.name,
      isUsed: integration ? true : false
    });
  }

  return pages;
};

export const getPageAccessToken = async (
  pageId: string,
  userAccessToken: string
) => {
  const response = await graphRequest.get(
    `${pageId}/?fields=access_token`,
    userAccessToken
  );

  return response.access_token;
};

export const refreshPageAccesToken = async (
  pageId: string,
  integration: IIntegrationDocument
) => {
  const account = await Accounts.getAccount({ _id: integration.accountId });

  const facebookPageTokensMap = integration.facebookPageTokensMap;

  const pageAccessToken = await getPageAccessToken(pageId, account.token);

  facebookPageTokensMap[pageId] = pageAccessToken;

  await Integrations.updateOne(
    { _id: integration._id },
    { $set: { facebookPageTokensMap } }
  );

  return facebookPageTokensMap;
};

export const getPageAccessTokenFromMap = (
  pageId: string,
  pageTokens: { [key: string]: string }
): string => {
  return (pageTokens || {})[pageId] || null;
};

export const subscribePage = async (
  pageId,
  pageToken
): Promise<{ success: true } | any> => {
  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields: ['conversations', 'feed', 'messages']
  });
};

export const getPostLink = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  postId: string
) => {
  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(`Error occurred while getting page access token: ${e.message}`);
    throw new Error();
  }

  try {
    const response: any = await graphRequest.get(
      `/${postId}?fields=permalink_url`,
      pageAccessToken
    );
    return response.permalink_url ? response.permalink_url : '';
  } catch (e) {
    debugError(`Error occurred while getting facebook post: ${e.message}`);
    return null;
  }
};

export const unsubscribePage = async (
  pageId,
  pageToken
): Promise<{ success: true } | any> => {
  return graphRequest
    .delete(`${pageId}/subscribed_apps`, pageToken)
    .then(res => res)
    .catch(e => {
      debugError(e);
      throw e;
    });
};

export const getFacebookUser = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  fbUserId: string
) => {
  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(`Error occurred while getting page access token: ${e.message}`);
    return null;
  }

  const pageToken = pageAccessToken;

  try {
    const response = await graphRequest.get(`/${fbUserId}`, pageToken);

    return response;
  } catch (e) {
    if (e.message.includes('access token')) {
      await Integrations.updateOne(
        { facebookPageIds: pageId },
        { $set: { healthStatus: 'page-token', error: `${e.message}` } }
      );
    }

    throw new Error(e);
  }
};

export const getFacebookUserProfilePic = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  fbId: string
) => {
  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(`Error occurred while getting page access token: ${e.message}`);
    throw new Error();
  }

  try {
    const response: any = await graphRequest.get(
      `/${fbId}/picture?height=600`,
      pageAccessToken
    );
    return response.image ? response.location : '';
  } catch (e) {
    debugError(
      `Error occurred while getting facebook user profile pic: ${e.message}`
    );
    return null;
  }
};

export const restorePost = async (
  postId: string,
  pageId: string,
  pageTokens: { [key: string]: string }
) => {
  let pageAccessToken;

  try {
    pageAccessToken = await getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(
      `Error ocurred while trying to get page access token with ${e.message}`
    );
  }

  const fields = `/${postId}?fields=caption,description,link,picture,source,message,from,created_time,comments.summary(true)`;

  try {
    return await graphRequest.get(fields, pageAccessToken);
  } catch (e) {
    throw new Error(e);
  }
};

export const sendReply = async (
  url: string,
  data: any,
  recipientId: string,
  integrationId: string
) => {
  const integration = await Integrations.getIntegration({
    erxesApiId: integrationId
  });

  const { facebookPageTokensMap } = integration;

  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(
      recipientId,
      facebookPageTokensMap
    );
  } catch (e) {
    debugError(
      `Error ocurred while trying to get page access token with ${e.message}`
    );
    return e;
  }

  try {
    const response = await graphRequest.post(`${url}`, pageAccessToken, {
      ...data
    });
    debugFacebook(`Successfully sent data to facebook ${JSON.stringify(data)}`);
    return response;
  } catch (e) {
    debugError(
      `Error ocurred while trying to send post request to facebook ${
        e.message
      } data: ${JSON.stringify(data)}`
    );

    if (e.message.includes('access token')) {
      await Integrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'page-token', error: `${e.message}` } }
      );
    } else if (e.code !== 10) {
      await Integrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'account-token', error: `${e.message}` } }
      );
    }

    if (e.message.includes('does not exist')) {
      throw new Error('Comment has been deleted by the customer');
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

    const url = generateAttachmentUrl(attachment.url);

    messages.push({
      attachment: {
        type,
        payload: {
          url
        }
      }
    });
  }

  return messages;
};

export const checkFacebookPages = async (pages: any) => {
  for (const page of pages) {
    const integration = await Integrations.findOne({ pageId: page.id });

    page.isUsed = integration ? true : false;
  }

  return pages;
};
