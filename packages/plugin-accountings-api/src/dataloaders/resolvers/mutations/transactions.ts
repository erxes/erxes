import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { ITransaction } from '../../../models/definitions/transaction';

interface ITransactionsEdit extends ITransaction {
  _id: string;
}

const transactionsMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async mainTrAdd(
    _root,
    doc: ITransaction,
    { user, docModifier, models, subdomain }: IContext,
  ) {
    const transaction =
      await models.Transactions.createTransaction(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        newData: { ...doc },
        object: transaction,
      },
      user,
    );

    return transaction;
  },

  /**
   * Edits a account category
   * @param {string} param2._id VatRow id
   * @param {Object} param2.doc VatRow info
   */
  async mainTrEdit(
    _root,
    { _id, ...doc }: ITransactionsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });
    const updated = await models.Transactions.updateTransaction(
      _id,
      doc,
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ACCOUNT_CATEGORY,
        object: transaction,
        newData: doc,
        updatedDocument: updated,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a account category
   * @param {string} param1._id VatRow id
   */
  async mainTrRemove(
    _root,
    { ids }: { ids: string[] },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      ids,
    });
    const removed = await models.Transactions.removeTransaction(ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: transaction },
      user,
    );

    return removed;
  },
};

checkPermission(transactionsMutations, 'mainTrAdd', 'manageTransactions');
checkPermission(transactionsMutations, 'mainTrEdit', 'manageTransactions');
checkPermission(transactionsMutations, 'mainTrRemove', 'manageTransactions');

export default transactionsMutations;
