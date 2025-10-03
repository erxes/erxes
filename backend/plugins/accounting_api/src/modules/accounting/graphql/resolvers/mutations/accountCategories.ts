import { IContext } from "~/connectionResolvers";
import { IAccountCategory } from "@/accounting/@types/accountCategory";

const accountCategoriessMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async accountCategoriesAdd(
    _root,
    doc: IAccountCategory,
    { models }: IContext,
  ) {
    const accountCategory =
      await models.AccountCategories.createAccountCategory(doc);
    return accountCategory;
  },

  /**
   * Edits a account category
   * @param {string} param2._id AccountCategory id
   * @param {Object} param2.doc AccountCategory info
   */
  async accountCategoriesEdit(
    _root,
    { _id, ...doc }: { _id: string } & IAccountCategory,
    { models }: IContext,
  ) {
    await models.AccountCategories.getAccountCategory({
      _id,
    });

    const updated = await models.AccountCategories.updateAccountCategory(
      _id,
      doc,
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
    { models }: IContext,
  ) {
    await models.AccountCategories.getAccountCategory({ _id, });
    const removed = await models.AccountCategories.removeAccountCategory(_id);

    return removed;
  },
};

// checkPermission(accountCategoriessMutations, 'accountCategoriesAdd', 'manageAccounts');
// checkPermission(accountCategoriessMutations, 'accountCategoriesEdit', 'manageAccounts');
// checkPermission(accountCategoriessMutations, 'accountCategoriesRemove', 'manageAccounts');

export default accountCategoriessMutations;
