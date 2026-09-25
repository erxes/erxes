import { generateAttachmentUrl } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { graphRequest, getPageAccessTokenFromMap } from './graphRequest';
import { uploadMedia } from './mediaUtils';

export { graphRequest, getPageAccessTokenFromMap } from './graphRequest';
export {
  createAWS,
  uploadMedia,
  invalidateUploadConfigCache,
} from './mediaUtils';
export {
  getPageList,
  getPageAccessToken,
  refreshPageAccessToken,
  subscribePage,
  getPostLink,
  unsubscribePage,
  getFacebookUser,
  restorePost,
} from './pageUtils';
export {
  HUMAN_AGENT_MESSENGER_TAG,
  normalizeMessengerTag,
  sendReply,
  sendReaction,
  generateAttachmentMessages,
} from './messageActions';

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

const MAX_POST_IMAGE_BYTES = 4 * 1024 * 1024;

export const uploadUnpublishedPhotoFromKey = async (
  subdomain: string,
  pageId: string,
  pageTokens: { [key: string]: string },
  fileKey: string,
): Promise<{ id: string }> => {
  const pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);

  if (!pageAccessToken) {
    throw new Error('Page access token not found');
  }

  if (!fileKey || /^[a-zA-Z]+:\/\//.test(fileKey) || fileKey.includes('..')) {
    throw new Error('Invalid image reference');
  }

  const sourceUrl = generateAttachmentUrl(
    subdomain,
    encodeURIComponent(fileKey),
  );

  let bytes: ArrayBuffer;

  try {
    const file = await fetch(sourceUrl);

    if (!file.ok) {
      throw new Error(`storage returned ${file.status}`);
    }

    bytes = await file.arrayBuffer();
  } catch (e) {
    debugError(`Error reading uploaded image ${fileKey}: ${e.message}`);
    throw new Error('Could not read the uploaded image');
  }

  if (bytes.byteLength > MAX_POST_IMAGE_BYTES) {
    throw new Error('Each image must be 4 MB or smaller');
  }

  const form = new FormData();
  form.append('published', 'false');
  form.append('access_token', pageAccessToken);
  form.append('source', new Blob([bytes]), fileKey.split('/').pop() || 'image');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v7.0/${pageId}/photos`,
      { method: 'POST', body: form },
    );

    const result = (await response.json()) as {
      id?: string;
      error?: { message?: string };
    };

    if (!response.ok || !result.id) {
      throw new Error(result?.error?.message || `HTTP ${response.status}`);
    }

    return { id: result.id };
  } catch (e) {
    debugError(`Error uploading facebook photo bytes: ${e.message}`);
    throw new Error(e.message);
  }
};

export const createPagePost = async (
  pageId: string,
  pageTokens: { [key: string]: string },
  message: string,
  link?: string,
  attachedMediaIds?: string[],
): Promise<{ id: string }> => {
  const pageAccessToken = getPageAccessTokenFromMap(pageId, pageTokens);

  if (!pageAccessToken) {
    throw new Error('Page access token not found');
  }

  const doc: { [key: string]: string } = { message };

  if (link) {
    doc.link = link;
  }

  for (let i = 0; i < (attachedMediaIds || []).length; i++) {
    doc[`attached_media[${i}]`] = JSON.stringify({
      media_fbid: (attachedMediaIds as string[])[i],
    });
  }

  try {
    // Requires the pages_manage_posts permission on the page token.
    const response: any = await graphRequest.post(
      `${pageId}/feed`,
      pageAccessToken,
      doc,
    );

    return response;
  } catch (e) {
    debugError(`Error occurred while creating facebook post: ${e.message}`);
    throw new Error(e.message);
  }
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

interface IFacebookPage {
  id: string;
  isUsed?: boolean;
  [key: string]: unknown;
}

export const checkFacebookPages = async (
  models: IModels,
  pages: IFacebookPage[],
) => {
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
    const response: { location: string } = await graphRequest.get(
      `/${fbId}/picture?height=600`,
      pageAccessToken,
    );

    const uploadConfig = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'configs',
      action: 'getFileUploadConfigs',
      input: {},
    });

    const { UPLOAD_SERVICE_TYPE } = uploadConfig || {};

    if (UPLOAD_SERVICE_TYPE === 'AWS') {
      const awsResponse = await uploadMedia(
        subdomain,
        response.location,
        false,
      );

      return awsResponse || response.location || null;
    }

    return response.location || null;
  } catch (e) {
    debugError(
      `Error occurred while getting facebook user profile pic: ${e.message}`,
    );
    return null;
  }
};

interface IFacebookWebhookEntry {
  messaging?: Array<{
    message?: {
      referral?: {
        source?: string;
        type?: string;
        ads_context_data?: unknown;
      };
    };
  }>;
}

export const checkIsAdsOpenThread = (entry: IFacebookWebhookEntry[] = []) => {
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

interface IFacebookField {
  name: string;
}

export const generateFieldBotOptions = async <T extends IFacebookField>(
  models: IModels,
  fields: T[],
) => {
  const bots = await models.FacebookBots.find({});

  const selectOptions: Array<{ label: string; value: string }> = bots.map(
    (bot) => ({
      value: bot._id,
      label: bot.name,
    }),
  );

  return fields.map((field) =>
    field.name === 'botId' ? { ...field, selectOptions } : field,
  );
};
