import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const CategoryQueries: IObjectTypeResolver<any, IContext> = {
  forumPermissionGroups: (_, __, { models: { PermissionGroup } }) => {
    return PermissionGroup.find({}).lean();
  },
  forumPermissionGroupCategoryPermits: (
    _,
    params,
    { models: { PermissionGroup } }
  ) => {
    const query: any = {};

    const fields = ['categoryId', 'permissionGroupId', 'permission'];

    for (const field of fields) {
      const param = params[field];

      if (param) {
        query[field] = { $in: param };
      }
    }

    return PermissionGroup.find(query).lean();
  }
};

export default CategoryQueries;
