import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IBlock, IBlockDocument, blockSchema } from './definitions/blocks';

export interface IBlockModel extends Model<IBlockDocument> {
  createBlock(doc: IBlock): Promise<IBlockDocument>;
  removeBlock(blockIds: string[]): Promise<IBlockDocument>;
  updateBlock(_id: string, doc: IBlock): Promise<IBlockDocument>;
}

export const loadBlockClass = (models: IModels) => {
  class Block {
    public static async createBlock(doc: IBlock) {
      return models.Blocks.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateBlock(_id, doc: IBlock) {
      await models.Blocks.updateOne(
        {
          _id
        },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.Blocks.findOne({ _id });
    }

    public static async removeBlock(blockIds) {
      return models.Blocks.deleteMany({ _id: { $in: blockIds } });
    }
  }

  blockSchema.loadClass(Block);

  return blockSchema;
};
