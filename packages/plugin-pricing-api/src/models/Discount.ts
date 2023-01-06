import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IDiscount,
  IDiscountDocument,
  discountSchema
} from './definitions/discount';

export interface IDiscountModel extends Model<IDiscountDocument> {
  discountAdd(doc: IDiscount, userId: string): Promise<IDiscountDocument>;
  discountEdit(
    id: string,
    doc: IDiscount,
    userId: string
  ): Promise<IDiscountDocument>;
  discountRemove(id: string): Promise<IDiscountDocument>;
}

export const loadDiscountClass = (models: IModels) => {
  class Discount {
    /**
     * Create discount
     * @param doc Discount document to create
     * @param userId Requested user id
     * @returns Created discount document
     */
    public static async discountAdd(doc: IDiscount, userId: string) {
      return models.Discounts.create({
        ...doc,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId
      });
    }

    /**
     * Update discount
     * @param id Discount ID to update
     * @param doc Discount document to update
     * @param userId Requested user id
     * @returns Updated discount document
     */
    public static async discountEdit(
      id: string,
      doc: IDiscount | any,
      userId: string
    ) {
      const result = await models.Discounts.findById(id);

      if (!result) return new Error(`Can't find discount`);

      if (doc._id) delete doc._id;

      await models.Discounts.findByIdAndUpdate(id, {
        $set: {
          ...doc,
          updatedAt: new Date(),
          updatedBy: userId
        }
      });

      return await models.Discounts.findById(id);
    }

    /**
     * Remove discount
     * @param id Discount ID to remove
     * @returns Removed discount document
     */
    public static async discountRemove(id: string) {
      const result = await models.Discounts.findById(id);

      if (!result) return new Error(`Can't find discount`);

      return await models.Discounts.findByIdAndDelete(id);
    }
  }

  discountSchema.loadClass(Discount);

  return discountSchema;
};
