import { nanoid } from 'nanoid';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
// import { checkValidationCurrency, doCurrencyTr } from '../../../utils/currencyTr';
import { JOURNALS } from '../../../models/definitions/constants';
import { ITransaction } from '../../../models/definitions/transaction';

const cashTrMutations = {
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async accCashTrAdd(
    _root,
    doc: ITransaction,
    { user, models, subdomain }: IContext,
  ) {
    const detail = doc.details[0];
    const updatedDoc = {
      ...doc,
      journal: JOURNALS.CASH,
      details: [{
        _id: nanoid(),
        accountId: detail.accountId,
        side: detail.side,
        amount: detail.amount,
      }]
    };

    // const currencyDiffTrDoc = await checkValidationCurrency(models, doc);

    const transaction =
      await models.Transactions.createTransaction({ ...updatedDoc });

    // await doCurrencyTr(models, transaction, currencyDiffTrDoc )

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
  async accCashTrEdit(
    _root,
    { _id, ...doc }: ITransaction & { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const transaction = await models.Transactions.getTransaction({
      _id,
    });
    const detail = doc.details[0];
    // const currencyDiffTrDoc = await checkValidationCurrency(models, doc);


    const updatedDoc = {
      ...doc,
      journal: JOURNALS.CASH,
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

    // if (currencyDiffTrDoc) {
    //   await doCurrencyTr(models, updated, currencyDiffTrDoc)
    // }

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
  async accCashTrRemove(
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

checkPermission(cashTrMutations, 'accCashTrAdd', 'manageTransactions');
checkPermission(cashTrMutations, 'accCashTrEdit', 'manageTransactions');
checkPermission(cashTrMutations, 'accCashTrRemove', 'manageTransactions');

export default cashTrMutations;
