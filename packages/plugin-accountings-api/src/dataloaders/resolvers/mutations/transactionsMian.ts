import { nanoid } from 'nanoid';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { IMainTrInput } from '../../../models/definitions/transaction';
import { JOURNALS } from '../../../models/definitions/constants';

const mainTrMutations = {
  async transactionsLink(_root, doc: { ids: string[], ptrId: string }, { user, models }) {
    const { ids, ptrId } = doc;
    return await models.Transactions.linkTransaction(ids, ptrId)
  },
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async mainTrAdd(
    _root,
    doc: IMainTrInput,
    { user, models, subdomain }: IContext,
  ) {
    const updatedDoc = {
      ...doc,
      journal: JOURNALS.MAIN,
      details: [{
        _id: nanoid(),
        accountId: doc.accountId,
        side: doc.side,
        amount: doc.amount,
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
  async mainTrEdit(
    _root,
    { _id, ...doc }: IMainTrInput & { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });

    const updatedDoc = {
      ...doc,
      journal: JOURNALS.MAIN,
      details: [{
        _id: nanoid(),
        accountId: doc.accountId,
        side: doc.side,
        amount: doc.amount,
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
  async mainTrRemove(
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

checkPermission(mainTrMutations, 'mainTrAdd', 'manageTransactions');
checkPermission(mainTrMutations, 'mainTrEdit', 'manageTransactions');
checkPermission(mainTrMutations, 'mainTrRemove', 'manageTransactions');

export default mainTrMutations;
