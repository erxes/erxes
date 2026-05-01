import { IModels } from '~/connectionResolvers';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from '@/integrations/instagram/controller/store';
import { ICommentParams } from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
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

  if (
    pageId == null ||
    pageId === '' ||
    rawPostId == null ||
    rawPostId === '' ||
    rawCommentId == null ||
    rawCommentId === '' ||
    rawFromId == null ||
    rawFromId === ''
  ) {
    throw new Error(
      'Instagram comment webhook is missing pageId, post_id, comment_id, or from.id',
    );
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
