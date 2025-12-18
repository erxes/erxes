import { IContext } from '~/connectionResolvers';

export const productMutations = {
  createInsuranceProduct: async (_parent: undefined, { name, insuranceTypeId, coveredRisks, pricingConfig }: { name: string; insuranceTypeId: string; coveredRisks: any[]; pricingConfig: any }, { models }: IContext) => {
    return models.Product.create({ name, insuranceType: insuranceTypeId, coveredRisks, pricingConfig });
  },

  updateInsuranceProduct: async (_parent: undefined, { id, name, coveredRisks, pricingConfig }: { id: string; name?: string; coveredRisks?: any[]; pricingConfig?: any }, { models }: IContext) => {
    return models.Product.findByIdAndUpdate(id, { name, coveredRisks, pricingConfig }, { new: true });
  },
};