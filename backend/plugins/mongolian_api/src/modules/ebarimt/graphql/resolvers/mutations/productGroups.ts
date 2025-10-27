import { checkPermission } from '../../../../../../../../erxes-api-shared/src/core-modules';
import { IContext } from '../../../connectionResolver';
import { IProductGroup } from '../../../db/definitions/productGroup';

const productGroupMutations = {
  async ebarimtProductGroupCreate(
    _root: unknown,
    doc: IProductGroup,
    { models, user }: IContext
  ) {
    return await models.ProductGroups.createProductGroup({
      ...doc,
      modifiedBy: user?._id,
    });
  },

  async ebarimtProductGroupUpdate(
    _root: unknown,
    { _id, ...doc }: { _id: string } & IProductGroup,
    { models, user }: IContext
  ) {
    return await models.ProductGroups.updateProductGroup(_id, {
      ...doc,
      modifiedBy: user?._id,
    });
  },

  async ebarimtProductGroupsRemove(
    _root: unknown,
    { ids }: { ids: string[] },
    { models }: IContext
  ) {
    return await models.ProductGroups.removeProductGroups(ids);
  },
};

checkPermission(productGroupMutations, 'ebarimtProductGroupCreate', 'syncEbarimtConfig');
checkPermission(productGroupMutations, 'ebarimtProductGroupUpdate', 'syncEbarimtConfig');
checkPermission(productGroupMutations, 'ebarimtProductGroupsRemove', 'syncEbarimtConfig');

export default productGroupMutations;
