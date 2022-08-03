import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendProductsMessage } from '../messageBroker';
import {
  IGetRemainder,
  IRemainder,
  IRemainderDocument,
  IRemainderParams,
  IRemaindersParams,
  remainderSchema
} from './definitions/remainders';

export interface IRemainderModel extends Model<IRemainderDocument> {
  getRemainderObject(_id: string): Promise<IRemainderDocument>;
  getRemainder(
    subdomain: string,
    params: IRemainderParams
  ): Promise<IGetRemainder>;
  getRemainders(
    subdomain: string,
    params: IRemaindersParams
  ): Promise<IRemainderDocument[]>;
  createRemainder(doc: IRemainder): Promise<IRemainderDocument>;
  updateRemainder(_id: string, doc: IRemainder): Promise<IRemainderDocument>;
  removeRemainder(_id: string): void;
}

export const loadRemainderClass = (models: IModels) => {
  class Remainder {
    /**
     * Get a remainder
     */
    public static async getRemainderObject(_id: string) {
      const remainder = await models.Remainders.findOne({ _id });

      if (!remainder) {
        return new Error('Remainder not found');
      }

      return remainder;
    }

    public static async getRemainder(
      subdomain: string,
      params: IRemainderParams
    ) {
      const { productId, departmentId, branchId, uomId } = params;
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

      const product = await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: {
          query: { _id: productId }
        },
        isRPC: true
      });

      let uom = product.uomId;

      const subUom = product.subUoms.filter(su => su.uomId === uomId) || [];
      if (subUom.length) {
        remainder = remainder / subUom.ratio || 1;
        uom = subUom.uomId;
      }
      remainder;

      return { remainder, uomId: uom };
    }

    public static async getRemainders(
      subdomain: string,
      {
        departmentId,
        branchId,
        productCategoryId,
        productIds
      }: IRemaindersParams
    ) {
      const selector: any = {};

      if (departmentId) {
        selector.departmentId = departmentId;
      }

      if (branchId) {
        selector.branchId = branchId;
      }

      if (productCategoryId) {
        const products = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {},
            categoryId: productCategoryId
          },
          isRPC: true
        });

        selector.productId = { $in: products.map(p => p._id) };
      }

      if (productIds) {
        selector.productId = { $in: productIds };
      }

      return models.Remainders.find(selector).lean();
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
      const remainder = await models.Remainders.getRemainderObject(_id);

      await models.Remainders.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Remainders.getRemainderObject(_id);

      return updated;
    }

    /**
     * Remove Remainder
     */
    public static async removeRemainder(_id: string) {
      await models.Remainders.getRemainderObject(_id);
      return models.Remainders.deleteOne({ _id });
    }
  }

  remainderSchema.loadClass(Remainder);

  return remainderSchema;
};
