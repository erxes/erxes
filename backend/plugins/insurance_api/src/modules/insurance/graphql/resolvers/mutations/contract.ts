import { IContext } from '~/connectionResolvers';
import { calculatePremium } from '../../../utils/pricing';

export const contractMutations = {
  createInsuranceContract: async (_parent: undefined, args: any, { models, user }: IContext) => {
    const {
      vendorId,
      customerId,
      productId,
      insuredObject,
      startDate,
      endDate,
    } = args;

    // 1. Load product + type
    const product = await models.Product.findById(productId)
      .populate('insuranceType');
    if (!product) throw new Error('Product not found');

    // 2. Get pricing (override or default)
    const vendor = await models.Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');
    const vendorProduct = vendor.offeredProducts.find(
      (vp: any) => vp.product.toString() === productId
    );
    const pricing = vendorProduct?.pricingOverride || product.pricingConfig;

    // 3. Calculate chargedAmount (your business logic here)
    const chargedAmount = calculatePremium(pricing, insuredObject, (product.insuranceType as any).name);

    // 4. Snapshot covered risks
    const coveredRisks = product.coveredRisks.map((cr: any) => ({
      risk: cr.risk,
      coveragePercentage: cr.coveragePercentage,
    }));

    // 5. Create contract
    return models.Contract.create({
      vendor: vendorId,
      customer: customerId,
      insuranceType: (product.insuranceType as any)._id,
      insuranceProduct: productId,
      coveredRisks,
      chargedAmount,
      startDate,
      endDate,
      insuredObject,
    }).then((contract: any) => contract.populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk'
    ));
  },
};