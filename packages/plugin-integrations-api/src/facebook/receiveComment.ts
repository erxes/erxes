import { IModels } from '../connectionResolver';
import { getOrCreateComment, getOrCreateCustomer } from './store';
import { ICommentParams } from './types';

const receiveComment = async (models: IModels, subdomain: string, params: ICommentParams, pageId: string) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const kind = 'facebook-post';
  const verb = params.verb || '';

  await getOrCreateCustomer(models, subdomain, pageId, userId, kind);

  const post = await models.FbPosts.findOne({ postId });

  if (!post) {
    throw new Error('Post not found');
  }

  return getOrCreateComment(models, subdomain, params, pageId, userId, verb);
};

export default receiveComment;
