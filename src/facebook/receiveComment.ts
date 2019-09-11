import { Accounts, Integrations } from '../models';
import { Posts } from './models';
import { getOrCreateComment, getOrCreateCustomer, getOrCreatePost } from './store';
import { ICommentParams } from './types';
import { restorePost } from './utils';

const receiveComment = async (params: ICommentParams, pageId: string) => {
  const userId = params.from.id;
  const postId = params.post_id;

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }],
  });

  const account = await Accounts.getAccount({ _id: integration.accountId });

  await getOrCreateCustomer(pageId, userId);

  const post = await Posts.findOne({ postId });

  if (!post) {
    const postResponse = await restorePost(postId, pageId, account.token);

    const restoredPostId = postResponse.from.id;

    const restoredComments = postResponse.comments.data;

    for (const comment of restoredComments) {
      comment.post_id = params.post_id;
      comment.comment_id = comment.id;

      const restoredUserId = comment.from.id;

      await getOrCreateCustomer(pageId, restoredUserId);
      await getOrCreateComment(comment, pageId, restoredUserId);
    }

    const customer = await getOrCreateCustomer(pageId, restoredPostId);

    return await getOrCreatePost(postResponse, pageId, userId, customer.erxesApiId);
  }

  return await getOrCreateComment(params, pageId, userId);
};

export default receiveComment;
