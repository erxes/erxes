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
  params: ICommentParams,
  pageId: string,
) => {
  const userId = params.from.id;
  const postId = params.post_id;

  if (userId === pageId) {
    return;
  }

  const integration = await models.InstagramIntegrations.findOne({
    $and: [
      { facebookPageId: pageId },
      { kind: INTEGRATION_KINDS.POST },
    ],
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    undefined,
    INTEGRATION_KINDS.POST,
  );

  if (!customer) {
    throw new Error('Customer not found');
  }

  const postConversation = await getOrCreatePostConversation(
    models,
    pageId,
    postId,
    params,
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
