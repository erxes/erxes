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
  },

  forumCateogryIsDescendantRelationship: (
    _,
    { ancestorId, descendantId },
    { models: { Category } }
  ) => {
    return Category.isDescendantRelationship(ancestorId, descendantId);
  },

  async forumCategoryPossibleParents(_, { _id }, { models: { Category } }) {
    const descendants = await Category.getDescendantsOf([_id]);
    const excludeIds = [_id, ...descendants.map(d => d._id)];
    return Category.find({ _id: { $nin: excludeIds } });
  }
};

export default CategoryQueries;
