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
  if (userId === pageId) {
    return;
  }
  if (!integration) {
    throw new Error('Integration not found');
  }
  const { facebookPageTokensMap, facebookPageId } = integration;
  if (facebookPageId && facebookPageTokensMap) {
    const customer = await getOrCreateCustomer(
      models,
      subdomain,
      pageId,
      userId,
      INTEGRATION_KINDS.POST,
      params
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
    } else {
      return {
        message: 'Both facebookPageTokensMap and facebookPageId are required.',
        facebookPageTokensMap: facebookPageTokensMap,
        facebookPageId: facebookPageId
      };
    }
  }
};

export default receiveComment;
