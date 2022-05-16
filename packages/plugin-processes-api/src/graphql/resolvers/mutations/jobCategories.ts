import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import { IJobCategory } from '../../../models/definitions/jobCategories';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IJobCategoriesEdit extends IJobCategory {
  _id: string;
}

const productMutations = {
  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */
  async productCategoriesAdd(
    _root,
    doc: IJobCategory,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const productCategory = await models.JobCategories.createJobCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        newData: { ...doc, order: productCategory.order },
        object: productCategory
      },
      user
    );

    return productCategory;
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async productCategoriesEdit(
    _root,
    { _id, ...doc }: IJobCategoriesEdit,
    { user, models, subdomain }: IContext
  ) {
    const productCategory = await models.JobCategories.getJobCategory(_id);
    const updated = await models.JobCategories.updateJobCategory(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        object: productCategory,
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
    const productCategory = await models.JobCategories.getJobCategory(_id);
    const removed = await models.JobCategories.removeJobCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.PRODUCT_CATEGORY, object: productCategory },
      user
    );

    return removed;
  }
};

moduleCheckPermission(productMutations, 'manageJobRefers');

export default productMutations;
