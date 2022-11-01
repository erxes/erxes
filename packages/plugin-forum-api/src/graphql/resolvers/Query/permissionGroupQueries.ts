import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { PermissionGroupCategoryPermitSchema } from '../../../db/models/permissionGroupModels/permissionGroupCategoryPermit';

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
    { models: { PermissionGroupCategoryPermit } }
  ) => {
    const query: any = {};

    const fields = ['categoryId', 'permissionGroupId', 'permission'];

    for (const field of fields) {
      const param = params[field];

      if (param) {
        query[field] = { $in: param };
      }
    }

    return PermissionGroupCategoryPermit.find(query).lean();
  }
};

export default permissionGroupQueries;
