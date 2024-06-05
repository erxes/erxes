import { IBlock, blockSchema ,IBlockDocument} from './definitions/blocks';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';
import { IContractDocument } from './definitions/contracts';

export interface IBlockModel extends Model<IBlockDocument> {
  getBlock(selector: FilterQuery<IBlockDocument>);
  createBlock(doc: IBlock): Promise<IBlockDocument>;
  removeBlocks(_ids: string[]);
}
export const loadBlockClass = (models: IModels) => {
  class Block {
    /**
     *
     * Get Block
     */

    public static async getBlock(
      selector: FilterQuery<IBlockDocument>
    ) {
      const block = await models.Block.findOne(selector);

      if (!block) {
        throw new Error('Block not found');
      }

      return block;
    }

    /**
     * Create a block
     */
    public static async createBlock(doc: IBlock) {
      
      const periodLock = await models.PeriodLocks.findOne({
        date: { $gte: doc.payDate }
      })
        .sort({ date: -1 })
        .lean();

      if (periodLock && !periodLock?.excludeContracts.includes(doc.contractId || 'undefined'))
        throw new Error(
          'At this moment block can not been created because this date closed'
        );

      const contract = await models.Contracts.findOne({
        _id: doc.contractId
      }).lean<IContractDocument>();

      console.log('contract',contract,doc)

      if (!doc.currency && contract?.currency) {
        doc.currency = contract?.currency;
      }
      if(contract)
        await models.Contracts.updateOne({_id:contract._id},{$set:{blockAmount:doc.amount}})

      const tr = await models.Block.create({ ...doc });

      return tr;
    }


    /**
     * Remove Block
     */
    public static async removeBlocks(_ids) {
      const blocks: IBlockDocument[] = await models.Block.find(
        { _id: _ids }
      )
        .sort({ payDate: -1 })
        .lean();

      for await (const oldTr of blocks) {
        if (oldTr) {
          const periodLock = await models.PeriodLocks.findOne({
            date: { $gte: oldTr.payDate }
          })
            .sort({ date: -1 })
            .lean();

          if (
            periodLock &&
            !periodLock?.excludeContracts.includes(oldTr.contractId || 'undefined')
          )
            throw new Error(
              'At this moment block can not been created because this date closed'
            );

          await models.Contracts.updateOne(
            { _id: oldTr.contractId },
            { $set: { blockAmount: oldTr.contractReaction?.blockAmount } }
          );

          await models.Block.deleteOne({ _id: oldTr._id });
        }
      }
    }
  }
  blockSchema.loadClass(Block);
  return blockSchema;
};
