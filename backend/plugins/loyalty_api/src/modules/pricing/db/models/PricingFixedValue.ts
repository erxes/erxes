import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { pricingFixedValueSchema } from '../definitions/pricingFixedValue';
import {
  IPricingConditionPrice,
  IPricingFixedValue,
  IPricingFixedValueDocument,
} from '@/pricing/@types/pricingFixedValue';

export interface IPricingFixedValueModel
  extends Model<IPricingFixedValueDocument> {
  createFixedValue(
    doc: IPricingFixedValue,
    userId: string,
  ): Promise<IPricingFixedValueDocument>;
  updateFixedValue(
    id: string,
    doc: Partial<IPricingFixedValue>,
    userId: string,
  ): Promise<IPricingFixedValueDocument>;
  removeFixedValue(id: string): Promise<IPricingFixedValueDocument>;
  removeByPlanId(pricingPlanId: string): Promise<void>;
}

// Drops empty cells; a condition keeps one price.
const cleanConditionPrices = (
  prices?: IPricingConditionPrice[],
): IPricingConditionPrice[] | undefined => {
  if (!prices) {
    return undefined;
  }

  const byCondition = new Map<string, number>();

  for (const { conditionId, price } of prices) {
    if (!conditionId || price == null) {
      continue;
    }

    if (price < 0) {
      throw new Error('A condition price cannot be negative');
    }

    byCondition.set(conditionId, price);
  }

  return [...byCondition].map(([conditionId, price]) => ({
    conditionId,
    price,
  }));
};

const prepareDoc = <T extends Partial<IPricingFixedValue>>(doc: T): T =>
  doc.conditionPrices === undefined
    ? doc
    : {
        ...doc,
        conditionPrices: cleanConditionPrices(doc.conditionPrices),
      };

export const loadPricingFixedValueClass = (models: IModels) => {
  class PricingFixedValue {
    public static async createFixedValue(
      doc: IPricingFixedValue,
      userId: string,
    ) {
      const result = await models.PricingFixedValues.findOneAndUpdate(
        { pricingPlanId: doc.pricingPlanId, productId: doc.productId },
        {
          $set: { ...prepareDoc(doc), updatedBy: userId },
          $setOnInsert: { createdBy: userId },
        },
        { upsert: true, new: true },
      );
      return result;
    }

    public static async updateFixedValue(
      id: string,
      doc: Partial<IPricingFixedValue>,
      userId: string,
    ) {
      const existing = await models.PricingFixedValues.findById(id);
      if (!existing) throw new Error(`Can't find fixed value`);

      await models.PricingFixedValues.findByIdAndUpdate(id, {
        $set: { ...prepareDoc(doc), updatedBy: userId },
      });
      return models.PricingFixedValues.findById(id);
    }

    public static async removeFixedValue(id: string) {
      const existing = await models.PricingFixedValues.findById(id);
      if (!existing) throw new Error(`Can't find fixed value`);
      return models.PricingFixedValues.findByIdAndDelete(id);
    }

    public static async removeByPlanId(pricingPlanId: string) {
      await models.PricingFixedValues.deleteMany({ pricingPlanId });
    }
  }

  pricingFixedValueSchema.loadClass(PricingFixedValue);
  return pricingFixedValueSchema;
};
