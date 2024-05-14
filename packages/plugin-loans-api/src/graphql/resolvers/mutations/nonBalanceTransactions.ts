import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import {
  INonBalanceTransaction,
  INonBalanceTransactionDocument
} from '../../../models/definitions/nonBalanceTransactions';
import { createLog, deleteLog, updateLog } from '../../../logUtils';

const nonBalanceTransactionMutations = {
  /**
  * create a nonBalanceTransaction
  */

  nonBalanceTransactionsAdd: async (
    _root,
    doc: INonBalanceTransaction,
    { user, models, subdomain }: IContext
  ) => {
    const nonBalanceTransactions = await models.NonBalanceTransactions.createNonBalanceTransaction(
      subdomain,
      doc
    );

    const logData = {
      type: 'nonBalanceTransaction',
      newData: doc,
      object: nonBalanceTransactions,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return nonBalanceTransactions;
  },

  /**
   * Updates a nonBalanceTransaction
   */

  nonBalanceTransactionsEdit: async (
    _root,
    { _id, ...doc }: INonBalanceTransactionDocument,
    { models, user, subdomain }: IContext
  ) => {
    const nonBalanceTransaction = await models.NonBalanceTransactions.getNonBalanceTransaction({
      _id
    });

    const updated = await models.NonBalanceTransactions.updateNonBalanceTransaction(
    _id ,
     doc 
    );
    
    const logData = {
      type: 'nonBalanceTransaction',
      object: nonBalanceTransaction,
      newData: { ...doc },
      updatedDocument: updated,
      extraParams: { models }
    };

    await updateLog(subdomain, user, logData);

    return updated;
  },
  /**
   * Removes nonBalanceTransaction
   */

  nonBalanceTransactionsRemove: async (
    _root,
    { nonBalanceTransactionIds }: { nonBalanceTransactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    
    const nonBalanceTransactions = await models.NonBalanceTransactions.find({ _id: { $in: nonBalanceTransactionIds } },{ $exists: true }).lean();

    await models.NonBalanceTransactions.removeNonBalanceTransactions(nonBalanceTransactions.map(a => a._id));

    for (const nonBalanceTransaction of nonBalanceTransactions) {
      const logData = {
        type: 'nonBalanceTransaction',
        object: nonBalanceTransaction,
        extraParams: { models }
      };

      await deleteLog(subdomain, user, logData);
    }

    return nonBalanceTransactionIds;
  },
};
 checkPermission(nonBalanceTransactionMutations, 'nonBalanceTransactionsAdd', 'manageNonBalanceTransaction');
 checkPermission(nonBalanceTransactionMutations, 'nonBalanceTransactionsRemove', 'nonBalanceTransactionsRemove');

export default nonBalanceTransactionMutations;
