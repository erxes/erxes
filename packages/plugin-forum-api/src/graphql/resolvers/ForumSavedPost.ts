import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { buildPostsQuery } from './Query/postQueries';
import { SavedPost } from '../../db/models/savepost';

const ForumSavedPost: IObjectTypeResolver<SavedPost, IContext> = {
  async post({ postId }, params, { models: { Post }, dataLoaders }) {
    return dataLoaders.post.load(postId);
  }
};

export default ForumSavedPost;
