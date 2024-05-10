import { nanoid } from 'nanoid';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { ISingleTrInput } from '../../../models/definitions/transaction';

const cashTrMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async cashTrAdd(
    _root,
    doc: ISingleTrInput,
    { user, models, subdomain }: IContext,
  ) {
    const mainCurrency = await models.AccountingConfigs.getConfig('MainCurrency');
    
    const updatedDoc = {
      ...doc,
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
  async cashTrEdit(
    _root,
    { _id, ...doc }: ISingleTrInput & { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });

    const updatedDoc = {
      ...doc,
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
  async cashTrRemove(
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

checkPermission(cashTrMutations, 'cashTrAdd', 'manageTransactions');
checkPermission(cashTrMutations, 'cashTrEdit', 'manageTransactions');
checkPermission(cashTrMutations, 'cashTrRemove', 'manageTransactions');

export default cashTrMutations;
