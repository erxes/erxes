import * as graph from 'fbgraph';
import { IModels } from '~/connectionResolvers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { debugError, debugFacebook } from '@/integrations/facebook/debuggers';
import { generateAttachmentUrl } from '@/integrations/facebook/commonUtils';
import {
  IAttachment,
  IAttachmentMessage,
} from '@/integrations/facebook/@types/utils';
import { randomAlphanumeric } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import * as AWS from 'aws-sdk';
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
  },
};

export const getPostDetails = async (
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
      `/${postId}?fields=permalink_url,message,created_time`,
      pageAccessToken,
    );

    return response;
  } catch (e) {
    debugError(`Error occurred while getting facebook post: ${e.message}`);
    return null;
  }
};

export const createAWS = async () => {
  const {
    AWS_FORCE_PATH_STYLE,
    AWS_COMPATIBLE_SERVICE_ENDPOINT,
    AWS_BUCKET,
    AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID,
  } = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'getFileUploadConfigs',
    input: {},
  });
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_BUCKET) {
    throw new Error('AWS credentials are not configured');
  }

  const options: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    s3ForcePathStyle?: boolean;
  } = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  if (String(AWS_FORCE_PATH_STYLE) === 'true') {
    options.s3ForcePathStyle = true;
  }

  if (AWS_COMPATIBLE_SERVICE_ENDPOINT) {
    options.endpoint = AWS_COMPATIBLE_SERVICE_ENDPOINT;
  }

  // initialize s3
  return new AWS.S3(options);
};

// Define a simple in-memory cache (outside the function scope)

type UploadConfig = { AWS_BUCKET: string };
let cachedUploadConfig: UploadConfig | null = null;
let isFetchingConfig = false; // Concurrency control
let lastFetchTime = 0; // Time-based cache invalidation
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const uploadMedia = async (
  subdomain: string,
  url: string,
  video: boolean,
) => {
  const mediaFile = `uploads/${randomAlphanumeric(16)}.${
    video ? 'mp4' : 'jpg'
  }`;
  // 1. Cache Handling (with concurrency + TTL)
  if (
    !cachedUploadConfig ||
    (Date.now() - lastFetchTime > CACHE_TTL_MS && !isFetchingConfig)
  ) {
    try {
      isFetchingConfig = true;
      cachedUploadConfig = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'getFileUploadConfigs',
        input: {},
      });
      lastFetchTime = Date.now();
    } catch (err) {
      debugError(`Failed to fetch upload config: ${err.message}`);
      return null;
    } finally {
      isFetchingConfig = false;
    }
  }

  // 2. Null check after potential fetch
  if (!cachedUploadConfig) {
    debugError(`Upload config unavailable after retry`);
    return null;
  }

  // 3. Upload to S3 (unchanged)
  const { AWS_BUCKET } = cachedUploadConfig;
  try {
    const s3 = await createAWS();

    // Additional security: Set timeout for fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'error', // Prevent redirects that could bypass our validation
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const data = await s3
        .upload({
          Bucket: AWS_BUCKET,
          Key: mediaFile,
          Body: buffer,
          ACL: 'public-read',
          ContentType: video ? 'video/mp4' : 'image/jpeg',
        })
        .promise();

      return data.Location;
    } finally {
      clearTimeout(timeout);
    }
  } catch (e) {
    debugError(`Upload failed: ${e.message}`);
    return null;
  }
};

// 4. Manual cache invalidation (call this when configs change)
export const invalidateUploadConfigCache = () => {
  cachedUploadConfig = null;
  lastFetchTime = 0;
};

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

  await models.FacebookIntegrations.updateOne(
    { _id: integration._id },
    { $set: { facebookPageTokensMap } },
  );

  return facebookPageTokensMap;
};

export const getPageAccessTokenFromMap = (
  pageId: string,
  pageTokens: { [key: string]: string },
): string => {
  return (pageTokens || {})[pageId];
};

export const subscribePage = async (
  models: IModels,
  pageId,
  pageToken,
): Promise<{ success: true } | any> => {
  const subscribed_fields = [
    'conversations',
    'feed',
    'messages',
    'standby',
    'messaging_handovers',
  ];

  return graphRequest.post(`${pageId}/subscribed_apps`, pageToken, {
    subscribed_fields,
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
    pageAccessToken = await getPageAccessTokenFromMap(pageId, pageTokens);
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

export const sendReply = async (
  models: IModels,
  url: string,
  data: any,
  recipientId: string,
  integrationId: string | undefined,
) => {
  if (!integrationId) {
    throw new Error('integrationId is required');
  }
  const integration = await models.FacebookIntegrations.getIntegration({
    erxesApiId: integrationId,
  });

  const { facebookPageTokensMap = {} } = integration;

  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(
      recipientId,
      facebookPageTokensMap,
    );
  } catch (e) {
    debugError(
      `Error occurred while trying to get page access token with ${e.message}`,
    );
    return e;
  }

  try {
    const response = await graphRequest.post(`${url}`, pageAccessToken, {
      ...data,
    });
    debugFacebook(`Successfully sent data to facebook ${JSON.stringify(data)}`);
    return response;
  } catch (e) {
    debugError(
      `Error ocurred while trying to send post request to facebook ${
        e.message
      } data: ${JSON.stringify(data)}`,
    );

    if (e.message.includes('access token')) {
      await models.FacebookIntegrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'page-token', error: `${e.message}` } },
      );
    } else if (e.code !== 10) {
      await models.FacebookIntegrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'account-token', error: `${e.message}` } },
      );
    }

    if (e.message.includes('does not exist')) {
      throw new Error('Comment has been deleted by the customer');
    }

    throw new Error(e.message);
  }
};

export const generateAttachmentMessages = (
  subdomain: string,
  attachments: IAttachment[],
) => {
  const messages: IAttachmentMessage[] = [];

  for (const attachment of attachments || []) {
    let type = 'file';

    if (attachment.type.startsWith('image')) {
      type = 'image';
    }

    const url = generateAttachmentUrl(subdomain, attachment.url);

    messages.push({
      attachment: {
        type,
        payload: {
          url,
        },
      },
    });
  }

  return messages;
};

export const fetchPagePost = async (postId: string, accessToken: string) => {
  const fields = 'message,created_time,full_picture,picture,permalink_url';

  const response = await graphRequest.get(
    `/${postId}?fields=${fields}&access_token=${accessToken}`,
  );

  return response || null;
};

export const fetchPagePosts = async (pageId: string, accessToken: string) => {
  const fields = 'message,created_time,full_picture,picture,permalink_url';
  const response = await graphRequest.get(
    `/${pageId}/posts?fields=${fields}&access_token=${accessToken}`,
  );

  return response.data || [];
};

export const fetchPagesPosts = async (pageId: string, accessToken: string) => {
  const fields = 'message,created_time,full_picture,picture,permalink_url';
  const response = await graphRequest.get(
    `/${pageId}/posts?fields=${fields}&access_token=${accessToken}`,
  );

  return response.data || [];
};

export const fetchPagesPostsList = async (
  pageId: string,
  accessToken: string,
  limit: number,
) => {
  const fields = 'message,created_time,full_picture,picture,permalink_url';

  const response = await graphRequest.get(
    `/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=${limit}`,
  );

  return response.data || [];
};

export const checkFacebookPages = async (models: IModels, pages: any) => {
  for (const page of pages) {
    const integration = await models.FacebookIntegrations.findOne({
      pageId: page.id,
    });

    page.isUsed = integration ? true : false;
  }

  return pages;
};

export const getFacebookUserProfilePic = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  fbId: string,
  subdomain: string,
): Promise<string | null> => {
  let pageAccessToken: string;

  try {
    pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);
  } catch (e) {
    debugError(`Error occurred while getting page access token: ${e.message}`);
    throw new Error();
  }

  try {
    const response: any = await graphRequest.get(
      `/${fbId}/picture?height=600`,
      pageAccessToken,
    );

    const { UPLOAD_SERVICE_TYPE } = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'getFileUploadConfigs',
      input: {},
    });

    if (UPLOAD_SERVICE_TYPE === 'AWS') {
      const awsResponse = await uploadMedia(
        subdomain,
        response.location,
        false,
      );

      return awsResponse as string; // Ensure the return type is string
    }

    // Return the profile picture URL directly if not uploading to AWS
    return response.location as string; // Type assertion to ensure it's a string
  } catch (e) {
    debugError(
      `Error occurred while getting facebook user profile pic: ${e.message}`,
    );
    return null;
  }
};

export const checkIsAdsOpenThread = (entry: any[] = []) => {
  const messaging = entry[0]?.messaging || [];

  const referral = (messaging || [])[0]?.message?.referral;

  if (!referral) {
    return false;
  }

  const isSourceAds = referral?.source === 'ADS';
  const isTypeOpenThread = referral?.type === 'OPEN_THREAD';
  const hasAdsContextData = !referral?.ads_context_data;

  return isSourceAds && isTypeOpenThread && hasAdsContextData;
};

export const generateFieldBotOptions = async (models: IModels, fields) => {
  const bots = await models.FacebookBots.find({});

  const selectOptions: Array<{ label: string; value: any }> = bots.map(
    (bot) => ({
      value: bot._id,
      label: bot.name,
    }),
  );

  return fields.map((field) =>
    field.name === 'botId' ? { ...field, selectOptions } : field,
  );
};
