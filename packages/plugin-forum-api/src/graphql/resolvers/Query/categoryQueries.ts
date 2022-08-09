import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const CategoryQueries: IObjectTypeResolver<any, IContext> = {
  forumCategoryByCode: (_, { code }, { models: { Category } }) => {
    return Category.findOne({ code }).lean();
  },
  forumCategories: (_, params, { models: { Category } }) => {
    const query: any = {};

    const fields = ['_id', 'parentId', 'code'];

    for (const field of fields) {
      const param = params[field];

      if (param) {
        query[field] = { $in: param };
      }
    }

    return Category.find(query).lean();
  },
  forumCategory: (_, { _id }, { models: { Category } }) => {
    return Category.findById(_id).lean();
  }
};

export default CategoryQueries;
