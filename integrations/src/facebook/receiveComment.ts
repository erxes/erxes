import { Integrations } from '../models';
import { Posts } from './models';
import { getOrCreateComment, getOrCreateCustomer, getOrCreatePost } from './store';
import { ICommentParams } from './types';
import { restorePost } from './utils';

const receiveComment = async (params: ICommentParams, pageId: string) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const kind = 'facebook-post';
  const verb = params.verb;

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind }],
  });

  await getOrCreateCustomer(pageId, userId, kind);

  const post = await Posts.findOne({ postId });

  if (!post) {
    let postResponse;

    try {
      postResponse = await restorePost(postId, pageId, integration.facebookPageTokensMap);
    } catch (e) {
      throw new Error(e);
    }

    const restoredPostId = postResponse.from.id;

    const restoredComments = postResponse.comments.data;

    for (const comment of restoredComments) {
      comment.post_id = params.post_id;
      comment.comment_id = comment.id;
      comment.restoredCommentCreatedAt = comment.created_time;

      const restoredUserId = comment.from.id;

      await getOrCreateCustomer(pageId, restoredUserId, kind);
      await getOrCreateComment(comment, pageId, restoredUserId, verb);
    }

    const customer = await getOrCreateCustomer(pageId, restoredPostId, kind);

    return await getOrCreatePost(postResponse, pageId, userId, customer.erxesApiId);
  }

  return getOrCreateComment(params, pageId, userId, verb);
};

export default receiveComment;
