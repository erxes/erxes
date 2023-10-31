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
  async forumDeleteCategory(_, { _id }, { models: { Category } }) {
    return Category.deleteCategory(_id);
  }
};

moduleRequireLogin(categoryMutations);

export default categoryMutations;
