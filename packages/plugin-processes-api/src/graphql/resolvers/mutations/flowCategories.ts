import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { IFlowCategory } from '../../../models/definitions/flowCategories';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IFlowCategoriesEdit extends IFlowCategory {
  _id: string;
}

const productMutations = {
  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */
  async productCategoriesAdd(
    _root,
    doc: IFlowCategory,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const flowCategory = await models.FlowCategories.createFlowCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        newData: { ...doc, order: flowCategory.order },
        object: flowCategory
      },
      user
    );

    return flowCategory;
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async productCategoriesEdit(
    _root,
    { _id, ...doc }: IFlowCategoriesEdit,
    { user, models, subdomain }: IContext
  ) {
    const flowCategory = await models.FlowCategories.getFlowCategory(_id);
    const updated = await models.FlowCategories.updateFlowCategory(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        object: flowCategory,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a product category
   * @param {string} param1._id ProductCategory id
   */
  async productCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const flowCategory = await models.FlowCategories.getFlowCategory(_id);
    const removed = await models.FlowCategories.removeFlowCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.PRODUCT_CATEGORY, object: flowCategory },
      user
    );

    return removed;
  }
};

moduleCheckPermission(productMutations, 'manageJobRefers');

export default productMutations;
