import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';
import { IComment } from '../../db/models/comment';

const ForumComment: IObjectTypeResolver<IComment, IContext> = {
  async post({ postId }, _, { models: { Post } }) {
    return Post.findById(postId).lean();
  },
  async replyTo({ replyToId }, _, { models: { Comment } }) {
    return Comment.findById(replyToId).lean();
  },
  async replies({ _id }, _, { models: { Comment } }) {
    return Comment.find({ replyToId: _id }).lean();
  },
  async createdBy({ createdById }) {
    return createdById && { __typename: 'User', _id: createdById };
  },
  async createdByCp({ createdByCpId }) {
    return (
      createdByCpId && { __typename: 'ClientPortalUser', _id: createdByCpId }
    );
  }
};

export default ForumComment;
