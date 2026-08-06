import { debugError } from '@/integrations/facebook/debuggers';
import {
  assertPostRateLimit,
  logPostAttempt,
} from '@/integrations/facebook/postGuard';
import {
  createPagePost,
  getPostDetails,
  graphRequest,
  uploadUnpublishedPhotoFromKey,
} from '@/integrations/facebook/utils';
import { IModels } from '~/connectionResolvers';

const MAX_POST_IMAGES = 10;

type TPageTokens = { [key: string]: string };

export interface ICreatePostArgs {
  erxesApiId: string;
  pageId: string;
  message: string;
  link?: string;
  imageKeys?: string[];
}

export interface ICreatePostResult {
  postId: string;
  permalinkUrl: string | null;
}

const trimValues = (values?: string[]): string[] =>
  (values || []).map((value) => `${value}`.trim()).filter(Boolean);

const validateImages = (imageKeys: string[], link?: string) => {
  if (imageKeys.length > MAX_POST_IMAGES) {
    throw new Error(`A post can include at most ${MAX_POST_IMAGES} images`);
  }

  if (imageKeys.length && link) {
    throw new Error(
      'A post can include images or a link preview, not both. Put the URL in the message text instead.',
    );
  }
};

const discardStagedMedia = async (
  pageId: string,
  pageTokens: TPageTokens,
  mediaIds: string[],
) => {
  for (const mediaId of mediaIds) {
    try {
      await graphRequest.delete(mediaId, pageTokens[pageId]);
    } catch (e) {
      debugError(`Failed to clean up staged photo ${mediaId}: ${e.message}`);
    }
  }
};

const stageImages = async (
  subdomain: string,
  pageId: string,
  pageTokens: TPageTokens,
  imageKeys: string[],
): Promise<string[]> => {
  const stagedMediaIds: string[] = [];

  try {
    for (const key of imageKeys) {
      const { id } = await uploadUnpublishedPhotoFromKey(
        subdomain,
        pageId,
        pageTokens,
        key,
      );

      stagedMediaIds.push(id);
    }
  } catch (e) {
    await discardStagedMedia(pageId, pageTokens, stagedMediaIds);

    throw e;
  }

  return stagedMediaIds;
};

const getPermalink = async (
  pageId: string,
  pageTokens: TPageTokens,
  postId: string,
): Promise<string | null> => {
  try {
    const details = await getPostDetails(pageId, pageTokens, postId);

    return details ? details.permalink_url : null;
  } catch (e) {
    debugError(`Permalink lookup failed for ${postId}: ${e.message}`);

    return null;
  }
};

export const publishPagePost = async (
  models: IModels,
  subdomain: string,
  args: ICreatePostArgs,
  userId?: string,
): Promise<ICreatePostResult> => {
  const { erxesApiId, pageId, message, link } = args;

  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  if (!(integration.facebookPageIds || []).includes(pageId)) {
    throw new Error('Page is not connected to this integration');
  }

  const imageKeys = trimValues(args.imageKeys);

  validateImages(imageKeys, link);

  const pageTokens: TPageTokens = integration.facebookPageTokensMap || {};
  const attempt = { erxesApiId, pageId, message, userId };

  try {
    await assertPostRateLimit(models, subdomain, pageId);
  } catch (e) {
    await logPostAttempt(models, {
      ...attempt,
      status: 'blocked',
      error: e.message,
    });

    throw e;
  }

  let stagedMediaIds: string[] = [];
  let response: { id: string };

  try {
    stagedMediaIds = await stageImages(
      subdomain,
      pageId,
      pageTokens,
      imageKeys,
    );

    response = await createPagePost(
      pageId,
      pageTokens,
      message,
      link,
      stagedMediaIds,
    );
  } catch (e) {
    await discardStagedMedia(pageId, pageTokens, stagedMediaIds);

    await logPostAttempt(models, {
      ...attempt,
      status: 'failed',
      error: e.message,
    });

    throw e;
  }

  const permalinkUrl = await getPermalink(pageId, pageTokens, response.id);

  await logPostAttempt(models, {
    ...attempt,
    status: 'published',
    postId: response.id,
    permalinkUrl,
  });

  return { postId: response.id, permalinkUrl };
};
