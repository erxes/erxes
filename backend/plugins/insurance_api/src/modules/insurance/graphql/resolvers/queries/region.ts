import { IContext } from '~/connectionResolvers';
import { calculateTravelTieredFee } from '@/insurance/utils/pricing';

export const regionQueries = {
  insuranceRegions: Object.assign(
    async (_parent: undefined, _args: any, { models }: IContext) => {
      return models.Region.find({}).sort({ name: 1 });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  insuranceRegion: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      return models.Region.findById(id);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  productsByCountry: Object.assign(
    async (
      _parent: undefined,
      { country }: { country: string },
      { models }: IContext,
    ) => {
      const regions = await models.Region.find({
        countries: country,
      });

      if (regions.length === 0) return [];

      const regionIds = regions.map((r: any) => r._id);

      const products = await models.Product.find({
        regions: { $in: regionIds },
      }).populate('insuranceType coveredRisks.risk regions');

      return products.map((p: any) => ({
        ...p.toObject(),
        coveredRisks: p.coveredRisks.filter((cr: any) => cr.risk != null),
      }));
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  calculateTravelPrice: Object.assign(
    async (
      _parent: undefined,
      {
        productId,
        vendorId,
        startDate,
        endDate,
        travelerCount,
      }: {
        productId: string;
        vendorId: string;
        startDate: Date;
        endDate: Date;
        travelerCount: number;
      },
      { models }: IContext,
    ) => {
      const product = await models.Product.findById(productId);
      if (!product) throw new Error('Product not found');

      const pricingConfig = product.pricingConfig;
      if (!pricingConfig) throw new Error('Product has no pricing config');

      const vendor = await models.Vendor.findById(vendorId);
      let discountTiers: any[] = [];

      if (vendor) {
        const offeredProduct = vendor.offeredProducts.find(
          (op: any) => op.product?.toString() === productId,
        );
        if (offeredProduct?.discountTiers) {
          discountTiers = offeredProduct.discountTiers;
        }
      }

      const days = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const safeDays = Math.max(days, 1);
      const safeCount = Math.max(travelerCount, 1);

      // Calculate per-person fee based on pricing type
      let perPersonFee = 0;
      if (pricingConfig.durationTiers && pricingConfig.durationTiers.length > 0) {
        perPersonFee = calculateTravelTieredFee(pricingConfig.durationTiers, safeDays);
      } else if (pricingConfig.dailyRate) {
        perPersonFee = pricingConfig.dailyRate * safeDays;
      } else if (pricingConfig.baseRate) {
        perPersonFee = pricingConfig.baseRate;
      }

      const grossTotal = perPersonFee * safeCount;

      let discountPercent = 0;
      if (discountTiers.length > 0) {
        const sorted = [...discountTiers].sort(
          (a: any, b: any) => b.minTravelers - a.minTravelers,
        );
        for (const tier of sorted) {
          if (safeCount >= tier.minTravelers) {
            discountPercent = tier.discountPercent;
            break;
          }
        }
      }

      const total = Math.round(grossTotal * (1 - discountPercent / 100));
      const perPerson = Math.round(total / safeCount);

      return {
        perPerson,
        total,
        discountPercent,
        days: safeDays,
        travelerCount: safeCount,
        dailyRate: perPersonFee,
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
