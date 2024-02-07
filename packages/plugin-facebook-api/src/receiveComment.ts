import { IModels } from './connectionResolver';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePostConversation,
} from './store';
import { ICommentParams } from './types';
import { INTEGRATION_KINDS } from './constants';

const receiveComment = async (
  models: IModels,
  subdomain: string,
  params: ICommentParams,
  pageId: string,
) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const integration = await models.Integrations.findOne({
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

  const postConversation = await getOrCreatePostConversation(
    models,
    subdomain,
    postId,
    integration,
    customer,
    params,
  );
  await getOrCreateComment(
    models,
    subdomain,
    postConversation,
    params,
    pageId,
    userId,
    params.verb || '',
    integration,
    customer,
  );
};

export default receiveComment;
