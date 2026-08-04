import { IModels } from '~/connectionResolvers';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from '@/integrations/instagram/controller/store';
import { ICommentParams } from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';

export const receiveComment = async (
  models: IModels,
  subdomain: string,
  rawParams: ICommentParams & { media?: { id: string }; text?: string },
  pageId: string,
) => {
  // Normalize Instagram webhook comment format to ICommentParams
  const params: ICommentParams = {
    ...rawParams,
    post_id: rawParams.post_id || rawParams.media?.id || '',
    comment_id: rawParams.comment_id || (rawParams as any).id,
    message: rawParams.message || rawParams.text,
  };

  const userId = params.from.id;
  const postId = params.post_id;

  if (userId === pageId) {
    return;
  }

  const integration = await models.InstagramIntegrations.findOne({
    $and: [{ instagramPageId: pageId }, { kind: INTEGRATION_KINDS.POST }],
  });
  if (!integration) {
    throw new Error('Integration not found');
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    INTEGRATION_KINDS.POST,
  );

  if (!customer) {
    throw new Error('Customer not found');
  }

  const postConversation = await getOrCreatePostConversation(
    models,
    pageId,
    postId,
  );

  if (!postConversation) {
    throw new Error('Post conversation not found');
  }

  await getOrCreateComment(
    models,
    subdomain,
    params,
    pageId,
    userId,
    integration,
    customer,
  );
};
