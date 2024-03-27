import { checkPermission } from '@erxes/api-utils/src/permissions';

import {
  IAccount,
  IAccountDocument,
} from '../../../models/definitions/account';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

interface IAccountsEdit extends IAccount {
  _id: string;
}

const accountsMutations = {
  /**
   * Creates a new account
   * @param {Object} doc Account document
   */
  async accountsAdd(
    _root,
    doc: IAccount,
    { user, docModifier, models, subdomain }: IContext,
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
        },
        object: account,
      },
      user,
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
    { user, models, subdomain }: IContext,
  ) {
    const account = await models.Accounts.getAccount({ _id });
    const updated = await models.Accounts.updateAccount(_id, {
      ...doc,
      status: 'active',
    });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT,
        object: account,
        newData: {
          ...doc,
          status: 'active',
        },
        updatedDocument: updated,
      },
      user,
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
    { user, models, subdomain }: IContext,
  ) {
    const accounts: IAccountDocument[] = await models.Accounts.find({
      _id: { $in: accountIds },
    }).lean();

    const response = await models.Accounts.removeAccounts(accountIds);

    for (const account of accounts) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.ACCOUNT, object: account },
        user,
      );
    }

    return response;
  },

  /**
   * Merge accounts
   */
  async accountsMerge(
    _root,
    {
      accountIds,
      accountFields,
    }: { accountIds: string[]; accountFields: IAccount },
    { models }: IContext,
  ) {
    return models.Accounts.mergeAccounts(accountIds, { ...accountFields });
  },
};

checkPermission(accountsMutations, 'accountsAdd', 'manageAccounts');
checkPermission(accountsMutations, 'accountsEdit', 'manageAccounts');
checkPermission(accountsMutations, 'accountsRemove', 'removeAccounts');
checkPermission(accountsMutations, 'accountsMerge', 'accountsMerge');

export default accountsMutations;
