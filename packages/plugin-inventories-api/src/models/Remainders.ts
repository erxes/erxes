import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IRemainder,
  IRemainderDocument,
  remainderSchema
} from './definitions/remainders';

export interface IRemainderModel extends Model<IRemainderDocument> {
  getRemainder(_id: string): Promise<IRemainderDocument>;
  createRemainder(doc: IRemainder): Promise<IRemainderDocument>;
  updateRemainder(_id: string, doc: IRemainder): Promise<IRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadRemainderClass = (models: IModels) => {
  class Remainder {
    /*
     * Get a remainder
     */
    public static async getRemainderObject(_id: string) {
      const remainder = await models.Remainders.findOne({ _id });

      if (!remainder) {
        throw new Error('Remainder not found');
      }

      return remainder;
    }

    public static async getRemainder(params: {
      productId: string;
      departmentId?: string;
      branchId?: string;
    }) {
      const { productId, departmentId, branchId } = params;
      const filter: any = { productId };

      if (departmentId) {
        filter.departmentId = departmentId;
      }

      if (branchId) {
        filter.branchId = branchId;
      }

      const remainders = await models.Remainders.find(filter);

      let remainder = 0;
      for (const rem of remainders) {
        remainder = remainder + rem.count;
      }

      return remainder;
    }

    /**
     * Create a remainder
     */
    public static async createRemainder(doc: IRemainder) {
      const remainder = await models.Remainders.create({
        ...doc,
        createdAt: new Date()
      });

      return remainder;
    }

    /**
     * Update Remainder
     */
    public static async updateRemainder(_id: string, doc: IRemainder) {
      const remainder = await models.Remainders.getRemainder(_id);

      await models.Remainders.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Remainders.getRemainder(_id);

      return updated;
    }

    /**
     * Remove Remainder
     */
    public static async removeRemainder(_id: string) {
      await models.Remainders.getRemainder(_id);
      return models.Remainders.deleteOne({ _id });
    }
  }

  remainderSchema.loadClass(Remainder);

  return remainderSchema;
};
