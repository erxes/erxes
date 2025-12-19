import { IContext } from '~/connectionResolvers';

export const productMutations = {
  createInsuranceProduct: async (_parent: undefined, args: any, { models }: IContext) => {
    const { insuranceTypeId, coveredRisks, ...rest } = args;
    const product = await models.Product.create({
      ...rest,
      insuranceType: insuranceTypeId,
      coveredRisks: coveredRisks.map((cr: any) => ({
        risk: cr.riskId,
        coveragePercentage: cr.coveragePercentage,
      })),
    });
    return product.populate('insuranceType coveredRisks.risk');
  },

  updateInsuranceProduct: async (_parent: undefined, { id, name, coveredRisks, pricingConfig }: { id: string; name?: string; coveredRisks?: any[]; pricingConfig?: any }, { models }: IContext) => {
    return models.Product.findByIdAndUpdate(id, { name, coveredRisks, pricingConfig }, { new: true });
  },

  deleteInsuranceProduct: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    await models.Product.findByIdAndDelete(id);
    return true;
  },
};