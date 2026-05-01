import { IModels } from '~/connectionResolvers';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from '@/integrations/instagram/controller/store';
import { ICommentParams } from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';

/**
 * Sanitize a value expected to be a string to prevent NoSQL injection.
 * Coerces non-string values (e.g. numbers, objects) to strings, which
 * neutralizes injection objects like {"$gt": ""} by converting them to
 * "[object Object]".
 */
const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value ?? '');
};

export const receiveComment = async (
  models: IModels,
  subdomain: string,
  rawParams: ICommentParams & { media?: { id: string }; text?: string },
  pageId: string,
) => {
  const safePageId = sanitizeString(pageId);

  // Normalize Instagram webhook comment format to ICommentParams
  const params: ICommentParams = {
    ...rawParams,
    post_id: sanitizeString(
      rawParams.post_id || rawParams.media?.id || '',
    ),
    comment_id: sanitizeString(
      rawParams.comment_id || (rawParams as any).id,
    ),
    message: rawParams.message || rawParams.text,
  };

  const userId = sanitizeString(params.from?.id);
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
