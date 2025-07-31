import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IProductGroup } from '../../../models/definitions/productGroup';

const productGroupMutations = {
  async ebarimtProductGroupCreate(_root, doc: IProductGroup, { models, user }: IContext) {
    return await models.ProductGroups.createProductGroup({ ...doc, modifiedBy: user._id });
  },

  async ebarimtProductGroupUpdate(_root, { _id, ...doc }: { _id: string } & IProductGroup, { models, user }: IContext) {
    return await models.ProductGroups.updateProductGroup(_id, { ...doc, modifiedBy: user._id });
  },
  async ebarimtProductGroupsRemove(_root, { ids }: { ids: string[] }, { models }: IContext) {
    return await models.ProductGroups.removeProductGroups(ids);
  }
};


checkPermission(productGroupMutations, 'ebarimtProductGroupCreate', 'syncEbarimtConfig');
checkPermission(productGroupMutations, 'ebarimtProductGroupUpdate', 'syncEbarimtConfig');
checkPermission(productGroupMutations, 'ebarimtProductGroupsRemove', 'syncEbarimtConfig');

export default productGroupMutations;
