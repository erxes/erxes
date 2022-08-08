import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const postMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreatePost(_, args, { models: { Post } }) {
    return await Post.create(args);
  }
};

export default postMutations;
