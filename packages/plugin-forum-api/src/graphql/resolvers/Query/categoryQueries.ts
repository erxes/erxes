import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const CategoryQueries: IObjectTypeResolver<any, IContext> = {
  forumCategoryByCode: (_, { code }, { models: { Category } }) => {
    return Category.findOne({ code }).lean();
  },
  forumCategories: (_, params, { models: { Category } }) => {
    const query: any = {};

    const fields = ['_id', 'parentId', 'code'];

    const { sort = {}, ...args } = params;

    for (const field of fields) {
      const param = args[field];

      if (param && param.length) {
        query[field] = { $in: param };
      }
    }

    for (const field of fields) {
      const paramName = `not_${field}`;
      const param = args[paramName];

      if (!param || !param?.length) continue;

      query[field] = { $nin: param };
    }

    return Category.find(query)
      .sort(sort)
      .lean();
  },
  forumCategory: (_, { _id }, { models: { Category } }) => {
    return Category.findById(_id).lean();
  },

  forumCategoryQuery(_, { query = {} }, { models: { Category } }) {
    return Category.find(query).lean();
  },

  forumCateogryIsDescendantRelationship: (
    _,
    { ancestorId, descendantId },
    { models: { Category } }
  ) => {
    return Category.isDescendantRelationship(ancestorId, descendantId);
  },

  async forumCategoryPossibleParents(_, { _id }, { models: { Category } }) {
    if (!_id) {
      return Category.find().lean();
    }
    const descendants = await Category.getDescendantsOf([_id]);
    const excludeIds = [_id, ...descendants.map(d => d._id)];
    return Category.find({ _id: { $nin: excludeIds } }).lean();
  },

  //forumCategoryIsUserPermitted(categoryId: ID!, permission: ForumPermission!, cpUserId: ID!): Boolean

  async forumCategoryIsUserPermitted(
    _,
    { categoryId, permission, cpUserId },
    { models: { PermissionGroupCategoryPermit } }
  ) {
    const res = await PermissionGroupCategoryPermit.isUserPermitted(
      categoryId,
      permission,
      cpUserId
    );
    return res;
  }
};

export default CategoryQueries;
