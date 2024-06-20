import { nanoid } from 'nanoid';
// import { checkPermission } from '@erxes/api-utils/src/permissions';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { JOURNALS } from '../../../models/definitions/constants';
import { ITransaction } from '../../../models/definitions/transaction';

const transactionsMutations = {
  async transactionsLink(_root, doc: { ids: string[], ptrId: string }, { user, models }) {
    const { ids, ptrId } = doc;
    return await models.Transactions.linkTransaction(ids, ptrId)
  },
  /**
   * Creates a new account category
   * @param {Object} doc Account category document
   */
  async transactionsCreate(
    _root,
    { trDocs }: { trDocs: ITransaction[] },
    { user, models, subdomain }: IContext,
  ) {

    const transactions = await models.Transactions.createPTransaction(trDocs);

    return transactions;
  },

  /**
   * Edits a account category
   * @param {string} param2._id VatRow id
   * @param {Object} param2.doc VatRow info
   */
  async transactionsEdit(
    _root,
    { parentId, trDocs }: { parentId: string, trDocs: ITransaction[] },
    { user, models, subdomain }: IContext,
  ) {
    console.log(parentId, trDocs)
    return trDocs;
  },

  /**
   * Removes a account category
   * @param {string} param1._id VatRow id
   */
  async transactionsRemove(
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

// checkPermission(transactionsMutations, 'transactionsCreate', 'manageTransactions');
// checkPermission(transactionsMutations, 'transactionsEdit', 'manageTransactions');
// checkPermission(transactionsMutations, 'transactionsRemove', 'manageTransactions');

export default transactionsMutations;
