import { IModels } from '~/connectionResolvers';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from '@/integrations/instagram/controller/store';
import { ICommentParams } from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { debugError } from '@/integrations/instagram/debuggers';
import { sanitizeString } from '@/integrations/instagram/utils';

export const receiveComment = async (
  models: IModels,
  subdomain: string,
  rawParams: ICommentParams & { media?: { id: string }; text?: string },
  pageId: string,
) => {
  const rawPostId = rawParams.post_id || rawParams.media?.id;
  const rawCommentId = rawParams.comment_id || (rawParams as any).id;
  const rawFromId = rawParams.from?.id;

  const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

  if (
    isEmpty(pageId) ||
    isEmpty(rawPostId) ||
    isEmpty(rawCommentId) ||
    isEmpty(rawFromId)
  ) {
    debugError(
      `[instagram.receiveComment] missing required webhook fields: pageId=${pageId ? 'present' : 'missing'} post_id=${rawPostId ? 'present' : 'missing'} comment_id=${rawCommentId ? 'present' : 'missing'} from.id=${rawFromId ? 'present' : 'missing'}`,
    );
    throw new Error('Invalid Instagram comment webhook payload');
  }

  const safePageId = sanitizeString(pageId);

  // Normalize Instagram webhook comment format to ICommentParams
  const params: ICommentParams = {
    ...rawParams,
    post_id: sanitizeString(rawPostId),
    comment_id: sanitizeString(rawCommentId),
    message: rawParams.message || rawParams.text,
  };

  const userId = sanitizeString(rawFromId);
  const postId = params.post_id;

  if (userId === safePageId) {
    return;
  }

  const integration = await models.InstagramIntegrations.findOne({
    $and: [
      { instagramPageId: { $eq: safePageId } },
      { kind: { $eq: INTEGRATION_KINDS.POST } },
    ],
  });
  if (!integration) {
    throw new Error('Integration not found');
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    safePageId,
    userId,
    INTEGRATION_KINDS.POST,
  );

  if (!customer) {
    throw new Error('Customer not found');
  }

  const postConversation = await getOrCreatePostConversation(
    models,
    safePageId,
    postId,
  );

  if (!postConversation) {
    throw new Error('Post conversation not found');
  }

  await getOrCreateComment(
    models,
    subdomain,
    params,
    safePageId,
    userId,
    integration,
    customer,
  );
};
