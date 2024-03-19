import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IAccountCategory } from '../../../models/definitions/accountCategory';

interface IAccountCategoriesEdit extends IAccountCategory {
  _id: string;
}

const accountCategoriessMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async accountCategoriesAdd(
    _root,
    doc: IAccountCategory,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const accountCategory =
      await models.AccountCategories.createAccountCategory(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        newData: { ...doc, order: accountCategory.order },
        object: accountCategory,
      },
      user,
    );

    return accountCategory;
  },

  /**
   * Edits a account category
   * @param {string} param2._id AccountCategory id
   * @param {Object} param2.doc AccountCategory info
   */
  async accountCategoriesEdit(
    _root,
    { _id, ...doc }: IAccountCategoriesEdit,
    { user, models, subdomain }: IContext,
  ) {
    const accountCategory = await models.AccountCategories.getAccountCategory({
      _id,
    });
    const updated = await models.AccountCategories.updateAccountCategory(
      _id,
      doc,
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        object: accountCategory,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a account category
   * @param {string} param1._id AccountCategory id
   */
  async accountCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const accountCategory = await models.AccountCategories.getAccountCategory({
      _id,
    });
    const removed = await models.AccountCategories.removeAccountCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: accountCategory },
      user,
    );

    return removed;
  },
};

checkPermission(accountCategoriessMutations, 'accountCategoriesAdd', 'manageAccounts');
checkPermission(accountCategoriessMutations, 'accountCategoriesEdit', 'manageAccounts');
checkPermission(accountCategoriessMutations, 'accountCategoriesRemove', 'manageAccounts');

export default accountCategoriessMutations;
