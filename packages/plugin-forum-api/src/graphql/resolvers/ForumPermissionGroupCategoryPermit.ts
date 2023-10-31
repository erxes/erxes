import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPermissionGroupCategoryPermit } from '../../db/models/permissionGroupModels/permissionGroupCategoryPermit';
import { Console } from 'console';

const ForumPermissionGroupCategoryPermit: IObjectTypeResolver<
  IPermissionGroupCategoryPermit,
  IContext
> = {
  async category({ categoryId }, _, { models: { Category } }) {
    return Category.findById(categoryId);
  },

  async permissionGroup(
    { permissionGroupId },
    _,
    { models: { PermissionGroup } }
  ) {
    return PermissionGroup.findById(permissionGroupId);
  }
};

export default ForumPermissionGroupCategoryPermit;
