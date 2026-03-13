import { IModels } from '~/connectionResolvers';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from '@/integrations/facebook/controller/store';
import { ICommentParams } from '@/integrations/facebook/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';

export const receiveComment = async (
  models: IModels,
  subdomain: string,
  params: ICommentParams,
  pageId: string,
) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const integration = await models.FacebookIntegrations.findOne({
    $and: [
      { facebookPageIds: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST },
    ],
  });

  if (userId === pageId) {
    return;
  }
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
