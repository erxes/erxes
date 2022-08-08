import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumPost: IObjectTypeResolver<IPost, IContext> = {
  async category({ categoryId }, _, { models: { Category } }) {
    return Category.findById(categoryId).lean();
  }
};

export default ForumPost;
