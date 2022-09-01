import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const categoryMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateCategory(_, args, { models: { Category } }) {
    return await Category.createCategory(args);
  },
  async forumPatchCategory(_, args, { models: { Category } }) {
    const { _id, ...patch } = args;
    return await Category.patchCategory(_id, patch);
  },
  async forumDeleteCategory(
    _,
    { _id, adopterCategoryId },
    { models: { Category } }
  ) {
    return Category.deleteCategory(_id, adopterCategoryId);
  },
  async forumForceDeleteCategory(_, { _id }, { models: { Category } }) {
    return Category.forceDeleteCategory(_id);
  }
};

moduleRequireLogin(categoryMutations);

export default categoryMutations;
