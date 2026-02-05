import { IContext } from '~/connectionResolvers';
import { calculatePremium } from '@/insurance/utils/pricing';

const generateContractNumber = async (models: any): Promise<string> => {
  const prefix = 'INS';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

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
    { models }: IContext,
  ) => {
    const {
      vendorId,
      customerId,
      productId,
      insuredObject,
      startDate,
      endDate,
      paymentKind = 'cash',
      chargedAmount,
    } = args;

    const product = await models.Product.findById(productId)
      .populate('insuranceType')
      .populate('coveredRisks.risk');
    if (!product) throw new Error('Product not found');

    // Get vendor to check for pricing override
    const vendor = await models.Vendor.findById(vendorId);
    const vendorProduct = vendor?.offeredProducts?.find(
      (op: any) => op.product.toString() === productId.toString(),
    );

    // Use vendor pricing override if exists, otherwise use product pricing
    const pricingConfig =
      vendorProduct?.pricingOverride || product.pricingConfig;

    // Calculate premium based on pricing config and insured object
    const calculatedAmount = calculatePremium(pricingConfig, insuredObject);

    const coveredRisks = (product.coveredRisks || [])
      .filter((cr: any) => cr.risk != null)
      .map((cr: any) => ({
        risk: cr.risk._id || cr.risk,
        coveragePercentage: cr.coveragePercentage,
      }));

    const contractNumber = await generateContractNumber(models);

    const contract = await models.Contract.create({
      contractNumber,
      vendor: vendorId,
      customer: customerId,
      insuranceType: (product.insuranceType as any)._id,
      insuranceProduct: productId,
      coveredRisks,
      chargedAmount: chargedAmount || calculatedAmount,
      startDate,
      endDate,
      insuredObject,
      paymentKind,
      paymentStatus: 'pending',
    });

    return contract.populate(
      'vendor customer insuranceType insuranceProduct coveredRisks.risk',
    );
  },
};
