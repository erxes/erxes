import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { buildPostsQuery } from './Query/postQueries';
import { SavedPost } from '../../db/models/savepost';

const ForumSavedPost: IObjectTypeResolver<SavedPost, IContext> = {
  async post({ postId }, params, { models: { Post } }) {
    return Post.findById(postId);
  }
};

export default ForumSavedPost;
