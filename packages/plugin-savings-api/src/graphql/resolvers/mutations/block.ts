import { IContext } from '../../../connectionResolver';
import { createLog, deleteLog } from '../../../logUtils';
import { IBlock } from '../../../models/definitions/blocks';

const transactionMutations = {
  savingsBlockAdd: async (
    _root,
    doc: IBlock,
    { user, models, subdomain }: IContext
  ) => {
    const transaction = await models.Block.createBlock(doc);

    const logData = {
      type: 'block',
      newData: doc,
      object: transaction,
      extraParams: { models }
    };

    await createLog(subdomain, user, logData);

    return transaction;
  },

  /**
   * Removes blocks
   */

  savingsBlocksRemove: async (
    _root,
    { transactionIds }: { transactionIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    
    const blocks = await models.Block.find({
      _id: { $in: transactionIds },
      isManual: true
    }).lean();

    await models.Block.removeBlocks(blocks.map(a => a._id));

    for (const transaction of blocks) {
      const logData = {
        type: 'transaction',
        object: transaction,
        extraParams: { models }
      };

      await deleteLog(subdomain, user, logData);
    }

    return transactionIds;
  }
};


export default transactionMutations;
