import { IModels } from './connectionResolver';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation
} from './store';
// import { ICommentParams } from './types';
import { INTEGRATION_KINDS } from './constants';

const receiveComment = async (
  models: IModels,
  subdomain: string,
  params: any,
  pageId: string
) => {
  const userId = params.from.id;
  const postId = params.media.id;
  const integration = await models.Integrations.findOne({
    $and: [
      { instagramPageId: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST }
    ]
  });
  if (!integration) {
    throw new Error('Integration not found');
  }
  const { facebookPageTokensMap, facebookPageId } = integration;
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    facebookPageId,
    INTEGRATION_KINDS.POST,
    facebookPageTokensMap
  );
  if (customer) {
    const postConversation = await getOrCreatePostConversation(
      models,
      pageId,
      subdomain,
      postId,
      integration,
      customer,
      params
    );
    await getOrCreateComment(
      models,
      subdomain,
      postConversation,
      params,
      pageId,
      userId,
      integration,
      customer
    );
  }
};

export default receiveComment;
