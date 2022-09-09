import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { ICategory } from '../../db/models/category';
import { buildPostsQuery } from './Query/postQueries';

const ForumCategory: IObjectTypeResolver<ICategory, IContext> = {
  async parent({ parentId }, _, { models: { Category } }) {
    return Category.findById(parentId).lean();
  },

  async children({ _id }, _, { models: { Category } }) {
    return Category.find({ parentId: _id }).lean();
  },

  async descendants({ _id }, _, { models: { Category } }) {
    return Category.getDescendantsOf([_id]);
  },

  async ancestors({ _id }, _, { models: { Category } }) {
    return Category.getAncestorsOf(_id);
  },
  async posts({ _id }, params, { models }) {
    const { Post } = models;
    const query: any = await buildPostsQuery(models, {
      ...params,
      categoryId: [_id]
    });
    const { limit = 0, offset = 0 } = params;

    return Post.find(query)
      .skip(offset)
      .limit(limit)
      .lean();
  },

  async postsCount({ _id }, params, { models }) {
    const { Post } = models;
    params.categoryId = [_id];
    const query: any = await buildPostsQuery(models, params);
    return Post.find(query).countDocuments();
  }
};

export default ForumCategory;
