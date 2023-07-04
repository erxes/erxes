import { checkPermission } from '@erxes/api-utils/src/permissions';

import {
  IAccount,
  IAccountCategory,
  IAccountDocument
} from '../../../models/definitions/accounts';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IAccountsEdit extends IAccount {
  _id: string;
}

interface IAccountCategoriesEdit extends IAccountCategory {
  _id: string;
}

const accountMutations = {
  /**
   * Creates a new account
   * @param {Object} doc Account document
   */
  async accountsAdd(
    _root,
    doc: IAccount,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const account = await models.Accounts.createAccount(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT,
        newData: {
          ...doc,
          categoryId: account.categoryId,
          customFieldsData: account.customFieldsData
        },
        object: account
      },
      user
    );

    return account;
  },

  /**
   * Edits a account
   * @param {string} param2._id Account id
   * @param {Object} param2.doc Account info
   */
  async accountsEdit(
    _root,
    { _id, ...doc }: IAccountsEdit,
    { user, models, subdomain }: IContext
  ) {
    const account = await models.Accounts.getAccount({ _id });
    const updated = await models.Accounts.updateAccount(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT,
        object: account,
        newData: { ...doc, customFieldsData: updated.customFieldsData },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a account
   * @param {string} param1._id Account id
   */
  async accountsRemove(
    _root,
    { accountIds }: { accountIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const accounts: IAccountDocument[] = await models.Accounts.find({
      _id: { $in: accountIds }
    }).lean();

    const response = await models.Accounts.removeAccounts(accountIds);

    for (const account of accounts) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.ACCOUNT, object: account },
        user
      );
    }

    return response;
  },

  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async accountCategoriesAdd(
    _root,
    doc: IAccountCategory,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const accountCategory = await models.AccountCategories.createAccountCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        newData: { ...doc, order: accountCategory.order },
        object: accountCategory
      },
      user
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
    { user, models, subdomain }: IContext
  ) {
    const accountCategory = await models.AccountCategories.getAccountCatogery({
      _id
    });
    const updated = await models.AccountCategories.updateAccountCategory(
      _id,
      doc
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        object: accountCategory,
        newData: doc,
        updatedDocument: updated
      },
      user
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
    { user, models, subdomain }: IContext
  ) {
    const accountCategory = await models.AccountCategories.getAccountCatogery({
      _id
    });
    const removed = await models.AccountCategories.removeAccountCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: accountCategory },
      user
    );

    return removed;
  },

  /**
   * Merge accounts
   */
  async accountsMerge(
    _root,
    {
      accountIds,
      accountFields
    }: { accountIds: string[]; accountFields: IAccount },
    { models }: IContext
  ) {
    return models.Accounts.mergeAccounts(accountIds, { ...accountFields });
  }
};

checkPermission(accountMutations, 'accountsAdd', 'manageAccounts');
checkPermission(accountMutations, 'accountsEdit', 'manageAccounts');
checkPermission(accountMutations, 'accountsRemove', 'manageAccounts');
checkPermission(accountMutations, 'accountsMerge', 'accountsMerge');

checkPermission(accountMutations, 'accountCategoriesAdd', 'manageAccounts');
checkPermission(accountMutations, 'accountCategoriesEdit', 'manageAccounts');
checkPermission(accountMutations, 'accountCategoriesRemove', 'manageAccounts');

export default accountMutations;
