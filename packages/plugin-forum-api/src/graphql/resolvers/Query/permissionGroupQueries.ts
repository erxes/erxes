import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const permissionGroupQueries: IObjectTypeResolver<any, IContext> = {
  forumPermissionGroup: async (_, { _id }, { models: { PermissionGroup } }) => {
    return PermissionGroup.findById(_id);
  },
  forumPermissionGroups: async (_, __, { models: { PermissionGroup } }) => {
    return PermissionGroup.find().lean();
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

export default permissionGroupQueries;
