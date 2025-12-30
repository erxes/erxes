import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { pricingSchema } from '@/pricing/db/definitions/pricing';
import { IPricing, IPricingDocument } from '@/pricing/@types/pricing';

export interface IPricingModel extends Model<IPricingDocument> {
  getPricing(_id: string): Promise<IPricingDocument>;
  getPricings(): Promise<IPricingDocument[]>;
  createPricing(doc: IPricing): Promise<IPricingDocument>;
  updatePricing(_id: string, doc: IPricing): Promise<IPricingDocument>;
  removePricing(PricingId: string): Promise<{  ok: number }>;
}

export const loadPricingClass = (models: IModels) => {
  class Pricing {

    public static async getPricing(_id: string) {
      const Pricing = await models.Pricing.findOne({ _id }).lean();

      if (!Pricing) {
        throw new Error('Pricing not found');
      }

      return Pricing;
    }

    public static async getPricings(): Promise<IPricingDocument[]> {
      return models.Pricing.find().lean();
    }

    public static async createPricing(doc: IPricing): Promise<IPricingDocument> {
      return models.Pricing.create(doc);
    }


    public static async updatePricing(_id: string, doc: IPricing) {
      return await models.Pricing.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    public static async removePricing(PricingId: string[]) {
      return models.Pricing.deleteOne({ _id: { $in: PricingId } });
    }
  }

  pricingSchema.loadClass(Pricing);

  return pricingSchema;
};
