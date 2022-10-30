import { IModels } from './connectionResolver';
import { getOrCreateComment, getOrCreateCustomer } from './store';
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

  await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    INTEGRATION_KINDS.POST
  );

  const post = await models.Posts.findOne({ postId });

  if (!post) {
    throw new Error('Post not found');
  }

  return getOrCreateComment(
    models,
    subdomain,
    params,
    pageId,
    userId,
    params.verb || ''
  );
};

export default receiveComment;
