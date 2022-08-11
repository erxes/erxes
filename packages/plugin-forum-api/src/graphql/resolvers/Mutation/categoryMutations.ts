import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const categoryMutations: IObjectTypeResolver<any, IContext> = {
  async forumCreateCategory(_, args, { models: { Category } }) {
    return await Category.createCategory(args);
  },
  async forumPatchCategory(_, args, { models: { Category } }) {
    const { _id, ...rest } = args;
    return await Category.patchCategory(_id, rest);
  },

  async forumCreateRootCategory(_, args, { models: { Category } }) {
    delete args.parentId;
    return await Category.createCategory(args);
  },
  async forumPatchRootCategory(_, args, { models: { Category } }) {
    delete args.parentId;
    const { _id, ...rest } = args;
    return await Category.patchCategory(_id, rest);
  },

  async forumCreateSubCategory(_, args, { models: { Category } }) {
    return await Category.createCategory(args);
  },
  async forumPatchSubCategory(_, args, { models: { Category } }) {
    if (args.parentId === null) {
      throw new Error(`Cannot set subcategory's parentId to \`null\``);
    }
    const { _id, ...rest } = args;
    return await Category.patchCategory(_id, rest);
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

export default categoryMutations;
