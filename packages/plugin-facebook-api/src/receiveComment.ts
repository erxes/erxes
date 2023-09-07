import { IModels } from './connectionResolver';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePost
} from './store';
import { ICommentParams } from './types';
import { INTEGRATION_KINDS } from './constants';

const receiveComment = async (
  models: IModels,
  subdomain: string,
  params: ICommentParams,
  pageId: string
) => {
  const userId = params.from.id;
  const postId = params.post_id;

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    INTEGRATION_KINDS.POST
  );

  let post = await models.Posts.findOne({ postId, receipendId: customer._id });

  if (!post) {
    post = await getOrCreatePost(
      models,
      subdomain,
      params,
      pageId,
      userId,
      customer._id
    );
  }

  return getOrCreateComment(
    models,
    subdomain,
    params,
    pageId,
    userId,
    params.verb || '',
    post,
    customer
  );
};

export default receiveComment;
