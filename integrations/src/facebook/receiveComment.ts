import { Posts } from './models';
import { getOrCreateComment, getOrCreateCustomer } from './store';
import { ICommentParams } from './types';

const receiveComment = async (params: ICommentParams, pageId: string) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const kind = 'facebook-post';
  const verb = params.verb;

  await getOrCreateCustomer(pageId, userId, kind);

  const post = await Posts.findOne({ postId });

  if (!post) {
    throw new Error('Post not found');
  }

  return getOrCreateComment(params, pageId, userId, verb);
};

export default receiveComment;
