import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IRemainderParams } from './definitions/remainders';
import {
  ISafeRemainder,
  ISafeRemainderDocument,
  ISafeRemItem,
  ISafeRemItemDocument,
  safeRemainderSchema,
  safeRemItemSchema
} from './definitions/safeRemainders';

export interface ISafeRemainderModel extends Model<ISafeRemainderDocument> {
  getRemainderObject(_id: string): Promise<ISafeRemainderDocument>;
  getRemainder(params: IRemainderParams): Promise<Number>;
  createRemainder(doc: ISafeRemainder): Promise<ISafeRemainderDocument>;
  updateRemainder(
    _id: string,
    doc: ISafeRemainder
  ): Promise<ISafeRemainderDocument>;
  removeRemainder(_id: string): void;
}

export interface ISafeRemItemModel extends Model<ISafeRemItemDocument> {
  getRemItemObject(_id: string): Promise<ISafeRemItemDocument>;
  getRemItem(params: IRemainderParams): Promise<Number>;
  createRemItem(doc: ISafeRemItem): Promise<ISafeRemItemDocument>;
  updateRemItem(_id: string, doc: ISafeRemItem): Promise<ISafeRemItemDocument>;
  removeRemItem(_id: string): void;
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
    public static async createRemainder(doc: ISafeRemainder) {
      const remainder = await models.SafeRemainders.create({
        ...doc,
        createdAt: new Date()
      });

      return remainder;
    }

    /**
     * Update Remainder
     */
    public static async updateRemainder(_id: string, doc: ISafeRemainder) {
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

export const loadSafeRemItemClass = (models: IModels) => {
  class RemItem {
    /*
     * Get a remItem
     */
    public static async getRemItemObject(_id: string) {
      const remItem = await models.SafeRemItems.findOne({ _id });

      if (!remItem) {
        throw new Error('RemItem not found');
      }

      return remItem;
    }

    public static async getRemItem(params: IRemainderParams) {
      const { productId, departmentId, branchId } = params;
      const filter: any = { productId };

      if (departmentId) {
        filter.departmentId = departmentId;
      }

      if (branchId) {
        filter.branchId = branchId;
      }

      const remItems = await models.SafeRemItems.find(filter);

      let remItem = 0;
      for (const rem of remItems) {
        remItem = remItem + rem.count;
      }

      return remItem;
    }

    /**
     * Create a remItem
     */
    public static async createRemItem(doc: ISafeRemItem) {
      const remItem = await models.SafeRemItems.create({
        ...doc,
        createdAt: new Date()
      });

      return remItem;
    }

    /**
     * Update RemItem
     */
    public static async updateRemItem(_id: string, doc: ISafeRemItem) {
      const remItem = await models.SafeRemItems.getRemItemObject(_id);

      await models.SafeRemItems.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.SafeRemItems.getRemItemObject(_id);

      return updated;
    }

    /**
     * Remove RemItem
     */
    public static async removeRemItem(_id: string) {
      await models.SafeRemItems.getRemItemObject(_id);
      return models.SafeRemItems.deleteOne({ _id });
    }
  }

  safeRemItemSchema.loadClass(RemItem);

  return safeRemItemSchema;
};
