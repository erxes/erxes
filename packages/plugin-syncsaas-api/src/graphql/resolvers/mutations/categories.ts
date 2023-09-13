import { IContext } from '../../../connectionResolver';

const categoriesMutations = {
  async addCategorySyncSaas(_root, args, { models }: IContext) {
    return await models.Categories.addCategory(args);
  },
  async editCategorySaasSync(_root, { _id, ...doc }, { models }: IContext) {
    return await models.Categories.editCategory(_id, doc);
  },
  async removeCategorySaasSync(_root, { _id }, { models }: IContext) {
    return await models.Categories.removeCategory(_id);
  }
};

export default categoriesMutations;
