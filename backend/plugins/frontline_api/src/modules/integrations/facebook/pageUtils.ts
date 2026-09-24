import { IFacebookIntegrationDocument } from './@types/integrations';
import { IModels } from '~/connectionResolvers';
import { debugError } from './debuggers';
import { SUBSCRIBED_FIELDS } from './constants';
import { graphRequest, getPageAccessTokenFromMap } from './graphRequest';

export const getPageList = async (
  models: IModels,
  accessToken?: string,
  kind?: string,
) => {
  const response: any = await graphRequest.get(
    '/me/accounts?limit=100',
    accessToken,
  );

  const pages: any[] = [];

  for (const page of response.data) {
    const integration = await models.FacebookIntegrations.findOne({
      facebookPageIds: page.id,
      kind,
    });

    pages.push({
      id: page.id,
      name: page.name,
      isUsed: integration ? true : false,
    });
  }

  return pages;
};

export const getPageAccessToken = async (
  pageId: string,
  userAccessToken: string,
) => {
  const response = await graphRequest.get(
    `${pageId}/?fields=access_token`,
    userAccessToken,
  );

  return response.access_token;
};

export const refreshPageAccessToken = async (
  models: IModels,
  pageId: string,
  integration: IFacebookIntegrationDocument,
) => {
  const account = await models.FacebookAccounts.getAccount({
    _id: integration.accountId,
  });

  const facebookPageTokensMap = integration.facebookPageTokensMap || {};

  const pageAccessToken = await getPageAccessToken(pageId, account.token);

  facebookPageTokensMap[pageId] = pageAccessToken;

  await models.FacebookBots.updatePageToken(pageId, pageAccessToken);

  await models.FacebookIntegrations.updateOne(
    { _id: integration._id },
    { $set: { facebookPageTokensMap } },
  );

  return facebookPageTokensMap;
};

export const subscribePage = async (
  models: IModels,
  pageId,
  pageToken,
): Promise<{ success: true } | any> => {
  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields: SUBSCRIBED_FIELDS,
  });
};

export const getPostLink = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  postId: string,
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
      pageAccessToken,
    );
    return response.permalink_url ? response.permalink_url : '';
  } catch (e) {
    debugError(`Error occurred while getting facebook post: ${e.message}`);
    return null;
  }
};

export const unsubscribePage = async (
  pageId,
  pageToken,
): Promise<{ success: true } | any> => {
  return graphRequest
    .delete(`${pageId}/subscribed_apps`, pageToken)
    .then((res) => res)
    .catch((e) => {
      debugError(e);
      throw e;
    });
};
export const getFacebookUser = async (
  models: IModels,
  pageId: string,
  pageTokens: { [key: string]: string },
  fbUserId: string,
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
      await models.FacebookIntegrations.updateOne(
        { facebookPageIds: pageId },
        { $set: { healthStatus: 'page-token', error: `${e.message}` } },
      );
    }

    throw new Error(e);
  }
};

export const restorePost = async (
  postId: string,
  pageId: string,
  pageTokens: { [key: string]: string },
) => {
  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(
      `Error occurred while trying to get page access token with ${e.message}`,
    );
  }

  const fields = `/${postId}?fields=caption,description,link,picture,source,message,from,created_time,comments.summary(true)`;

  try {
    return await graphRequest.get(fields, pageAccessToken);
  } catch (e) {
    throw new Error(e);
  }
};
