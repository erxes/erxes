import { IContext } from "~/connectionResolvers";
import { IAccount } from "@/accounting/@types/account";

const accountsMutations = {
  /**
   * Creates a new account
   * @param {Object} doc Account document
   */
  async accountsAdd(
    _root,
    doc: IAccount,
    { models }: IContext,
  ) {
    const account = await models.Accounts.createAccount(doc);
    return account;
  },

  /**
   * Edits a account
   * @param {string} param2._id Account id
   * @param {Object} param2.doc Account info
   */
  async accountsEdit(
    _root,
    { _id, ...doc }: { _id: string } & IAccount,
    { models }: IContext,
  ) {
    await models.Accounts.getAccount({ _id });
    const updated = await models.Accounts.updateAccount(_id, {
      ...doc,
      status: 'active',
    });

    return updated;
  },

  /**
   * Removes a account
   * @param {string} param1._id Account id
   */
  async accountsRemove(
    _root,
    { accountIds }: { accountIds: string[] },
    { models }: IContext,
  ) {
    const response = await models.Accounts.removeAccounts(accountIds);

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

// checkPermission(accountsMutations, 'accountsAdd', 'manageAccounts');
// checkPermission(accountsMutations, 'accountsEdit', 'manageAccounts');
// checkPermission(accountsMutations, 'accountsRemove', 'removeAccounts');
// checkPermission(accountsMutations, 'accountsMerge', 'accountsMerge');

export default accountsMutations;
