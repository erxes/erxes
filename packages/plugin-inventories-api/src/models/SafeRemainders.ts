import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IRemainder, IRemainderDocument } from './definitions/remainders';
import { safeRemainderSchema } from './definitions/safeRemainders';

export interface IRemainderParams {
  productId: string;
  departmentId?: string;
  branchId?: string;
}

export interface ISafeRemainderModel extends Model<IRemainderDocument> {
  getRemainderObject(_id: string): Promise<IRemainderDocument>;
  getRemainder(params: IRemainderParams): Promise<Number>;
  createRemainder(doc: IRemainder): Promise<IRemainderDocument>;
  updateRemainder(_id: string, doc: IRemainder): Promise<IRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadSafeRemainderClass = (models: IModels) => {
  class Remainder {
    /*
     * Get a remainder
     */
    public static async getRemainderObject(_id: string) {
      const remainder = await models.SafeRemainders.findOne({ _id });

      if (!remainder) {
        throw new Error('Remainder not found');
      }

      return remainder;
    }

    public static async getRemainder(params: IRemainderParams) {
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
      const remainder = await models.SafeRemainders.create({
        ...doc,
        createdAt: new Date()
      });

      return remainder;
    }

    /**
     * Update Remainder
     */
    public static async updateRemainder(_id: string, doc: IRemainder) {
      const remainder = await models.SafeRemainders.getRemainderObject(_id);

      await models.SafeRemainders.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.SafeRemainders.getRemainderObject(_id);

      return updated;
    }

    /**
     * Remove Remainder
     */
    public static async removeRemainder(_id: string) {
      await models.SafeRemainders.getRemainderObject(_id);
      return models.SafeRemainders.deleteOne({ _id });
    }
  }

  safeRemainderSchema.loadClass(Remainder);

  return safeRemainderSchema;
};
