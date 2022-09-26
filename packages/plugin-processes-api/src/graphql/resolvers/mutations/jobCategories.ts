// import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
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

const jobCategoryMutations = {
  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */
  async jobCategoriesAdd(
    _root,
    doc: IJobCategory,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const jobCategory = await models.JobCategories.createJobCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        newData: { ...doc, order: jobCategory.order },
        object: jobCategory
      },
      user
    );

    return jobCategory;
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async jobCategoriesEdit(
    _root,
    { _id, ...doc }: IJobCategoriesEdit,
    { user, models, subdomain }: IContext
  ) {
    const jobCategory = await models.JobCategories.getJobCategory(_id);
    const updated = await models.JobCategories.updateJobCategory(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        object: jobCategory,
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
  async jobCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const jobCategory = await models.JobCategories.getJobCategory(_id);
    const removed = await models.JobCategories.removeJobCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.PRODUCT_CATEGORY, object: jobCategory },
      user
    );

    return removed;
  }
};

// moduleCheckPermission(jobCategoryMutations, 'manageJobs');

export default jobCategoryMutations;
