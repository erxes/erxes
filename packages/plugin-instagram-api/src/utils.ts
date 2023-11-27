import * as graph from 'fbgraph';

import { IModels } from './connectionResolver';
import { debugBase, debugError, debugInstagram } from './debuggers';
import { generateAttachmentUrl, getConfig } from './commonUtils';
import { IAttachment, IAttachmentMessage } from './types';
import { IIntegrationDocument } from './models/Integrations';

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
export const getFacebookPageIdsForInsta = async (
  accessToken: string,
  instagramPageId: string
): Promise<string | null> => {
  const response: any = await graphRequest.get(
    '/me/accounts?fields=instagram_business_account, access_token,id,name',
    accessToken
  );

  for (const page of response.data) {
    if (page.instagram_business_account) {
      const pageId = page.instagram_business_account.id;
      if (pageId === instagramPageId) {
        return page.id; // Return the found page ID as a string
      }
    }
  }

  // Return null if no matching page is found
  return null;
};

export const subscribePage = async (
  pageId,
  pageToken
): Promise<{ success: true } | any> => {
  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields: ['conversations', 'feed', 'messages']
  });
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
  models: IModels,
  pageId: string,
  integration: IIntegrationDocument
) => {
  const account = await models.Accounts.getAccount({
    _id: integration.accountId
  });

  const facebookPageTokensMap = integration.facebookPageTokensMap || {};

  const pageAccessToken = await getPageAccessToken(pageId, account.token);

  facebookPageTokensMap[pageId] = pageAccessToken;

  await models.Integrations.updateOne(
    { _id: integration._id },
    { $set: { facebookPageTokensMap } }
  );

  return facebookPageTokensMap;
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
export const getPageList = async (
  models: IModels,
  accessToken?: string,
  kind?: string
) => {
  const response: any = await graphRequest.get(
    '/me/accounts?fields=instagram_business_account, access_token,id,name',
    accessToken
  );

  const pages: any[] = [];

  for (const page of response.data) {
    if (page.instagram_business_account) {
      const pageId = page.instagram_business_account.id;
      const accounInfo: any = await graphRequest.get(
        `${pageId}?fields=username`,
        accessToken
      );

      const integration = await models.Integrations.findOne({
        instagramPageId: accounInfo.id,
        kind
      });

      pages.push({
        id: accounInfo.id,
        name: accounInfo.username,
        isUsed: integration ? true : false
      });
    }
  }

  return pages;
};

export const getPageAccessTokenFromMap = (
  pageId: string,
  pageTokens: { [key: string]: string }
): string => {
  return (pageTokens || {})[pageId];
};

export const getInstagramUser = async (
  userId: string,
  facebookPageId: string,
  facebookPageTokensMap?: { [key: string]: string }
) => {
  if (facebookPageTokensMap !== undefined) {
    const token = await getPageAccessTokenFromMap(
      facebookPageId,
      facebookPageTokensMap
    );
    const accounInfo: any = await graphRequest.get(
      `${userId}?fields=name,profile_pic`,
      token
    );

    return accounInfo;
    // Rest of the function logic
  } else {
    // Handle the case where facebookPageTokensMap is undefined, for example:
    // You can return a default value
    // return someDefaultValue;

    // Or throw an error
    throw new Error(
      'facebookPageTokensMap is undefined. Unable to get Instagram user.'
    );
  }
};

export const sendReply = async (
  models: IModels,
  url: string,
  data: any,
  integrationId: string
) => {
  let integration;
  try {
    integration = await models.Integrations.getIntegration({
      erxesApiId: integrationId
    });

    // Continue with the code assuming the integration was successfully retrieved
  } catch (error) {
    // Handle the error
    throw new Error(error);
  }

  const { facebookPageTokensMap = {}, facebookPageId } = integration;

  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(
      facebookPageId,
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
    debugInstagram(
      `Successfully sent data to Instagram ${JSON.stringify(data)}`
    );
    return response;
  } catch (e) {
    debugError(
      `Error ocurred while trying to send post request to facebook ${
        e.message
      } data: ${JSON.stringify(data)}`
    );
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
