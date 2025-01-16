import { nanoid } from 'nanoid';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { JOURNALS } from '../../../models/definitions/constants';
import { ITransaction } from '../../../models/definitions/transaction';

const mainTrMutations = {
  async accTransactionsLink(_root, doc: { ids: string[], ptrId: string }, { user, models }) {
    const { ids, ptrId } = doc;
    return await models.Transactions.linkTransaction(ids, ptrId)
  },
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async accMainTrAdd(
    _root,
    doc: ITransaction,
    { user, models, subdomain }: IContext,
  ) {
    const detail = doc.details[0];

    const updatedDoc = {
      ...doc,
      journal: JOURNALS.MAIN,
      details: [{
        _id: nanoid(),
        accountId: detail.accountId,
        side: detail.side,
        amount: detail.amount,
      }]
    };

    const transaction =
      await models.Transactions.createTransaction({ ...updatedDoc });

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
  async accMainTrEdit(
    _root,
    { _id, ...doc }: ITransaction & { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });

    const detail = doc.details[0];
    const updatedDoc = {
      ...doc,
      journal: JOURNALS.MAIN,
      details: [{
        _id: nanoid(),
        accountId: detail.accountId,
        side: detail.side,
        amount: detail.amount,
      }]
    };

    const updated = await models.Transactions.updateTransaction(
      _id,
      updatedDoc,
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
  async accMainTrRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });
    const removed = await models.Transactions.removeTransaction(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ACCOUNT_CATEGORY, object: transaction },
      user,
    );

    return removed;
  },
};

checkPermission(mainTrMutations, 'accMainTrAdd', 'manageTransactions');
checkPermission(mainTrMutations, 'accMainTrEdit', 'manageTransactions');
checkPermission(mainTrMutations, 'accMainTrRemove', 'manageTransactions');

export default mainTrMutations;
