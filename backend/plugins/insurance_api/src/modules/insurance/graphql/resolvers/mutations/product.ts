import { IContext } from '~/connectionResolvers';

// Helper function to generate unique code from name
const generateCode = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Generate unique code by checking for duplicates
const generateUniqueCode = async (
  models: any,
  baseName: string,
): Promise<string> => {
  let code = generateCode(baseName);
  let counter = 1;

  // Check if code exists
  while (await models.Product.findOne({ code })) {
    code = `${generateCode(baseName)}_${counter}`;
    counter++;
  }

  return code;
};

export const productMutations = {
  createInsuranceProduct: async (
    _parent: undefined,
    args: any,
    { models }: IContext,
  ) => {
    const { insuranceTypeId, coveredRisks, name, ...rest } = args;
    const code = await generateUniqueCode(models, name);
    const product = await models.Product.create({
      ...rest,
      name,
      code,
      insuranceType: insuranceTypeId,
      coveredRisks: coveredRisks.map((cr: any) => ({
        risk: cr.riskId,
        coveragePercentage: cr.coveragePercentage,
      })),
    });
    return product.populate('insuranceType coveredRisks.risk');
  },

  updateInsuranceProduct: async (
    _parent: undefined,
    {
      id,
      name,
      coveredRisks,
      pricingConfig,
    }: { id: string; name?: string; coveredRisks?: any[]; pricingConfig?: any },
    { models }: IContext,
  ) => {
    return models.Product.findByIdAndUpdate(
      id,
      { name, coveredRisks, pricingConfig },
      { new: true },
    );
  },

  deleteInsuranceProduct: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.Product.findByIdAndDelete(id);
    return true;
  },
};
