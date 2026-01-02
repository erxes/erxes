import { IContext } from '~/connectionResolvers';
import { calculatePremium } from '../../../utils/pricing';

// Generate unique contract number
const generateContractNumber = async (models: any): Promise<string> => {
  const prefix = 'INS';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Find the last contract number for this month
  const lastContract = await models.Contract.findOne({
    contractNumber: new RegExp(`^${prefix}${year}${month}`),
  }).sort({ contractNumber: -1 });

  let sequence = 1;
  if (lastContract?.contractNumber) {
    const lastSequence = parseInt(lastContract.contractNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
};

export const contractMutations = {
  createInsuranceContract: async (
    _parent: undefined,
    args: any,
    { models, user }: IContext,
  ) => {
    const {
      vendorId,
      customerId,
      productId,
      insuredObject,
      startDate,
      endDate,
      paymentKind = 'cash',
    } = args;

    // 1. Load product + type
    const product = await models.Product.findById(productId).populate(
      'insuranceType',
    );
    if (!product) throw new Error('Product not found');

    // 2. Get pricing (override or default)
    const vendor = await models.Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');
    const vendorProduct = vendor.offeredProducts.find(
      (vp: any) => vp.product.toString() === productId,
    );
    const pricing = vendorProduct?.pricingOverride || product.pricingConfig;

    // 3. Calculate chargedAmount (your business logic here)
    const chargedAmount = calculatePremium(
      pricing,
      insuredObject,
      (product.insuranceType as any).name,
    );

    // 4. Snapshot covered risks
    const coveredRisks = product.coveredRisks.map((cr: any) => ({
      risk: cr.risk,
      coveragePercentage: cr.coveragePercentage,
    }));

    // 5. Generate contract number
    const contractNumber = await generateContractNumber(models);

    // 6. Create contract
    return models.Contract.create({
      contractNumber,
      vendor: vendorId,
      customer: customerId,
      insuranceType: (product.insuranceType as any)._id,
      insuranceProduct: productId,
      coveredRisks,
      chargedAmount,
      startDate,
      endDate,
      insuredObject,
      paymentKind,
      paymentStatus: 'pending',
    }).then((contract: any) =>
      contract.populate(
        'vendor customer insuranceType insuranceProduct coveredRisks.risk',
      ),
    );
  },
};
