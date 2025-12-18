import { IContext } from '~/connectionResolvers';

export const insuranceTypeMutations = {
  createInsuranceType: async (_parent: undefined, { name, attributes }: { name: string; attributes: any[] }, { models }: IContext) => {
    return models.InsuranceType.create({ name, attributes });
  },

  updateInsuranceType: async (_parent: undefined, { id, name, attributes }: { id: string; name?: string; attributes?: any[] }, { models }: IContext) => {
    return models.InsuranceType.findByIdAndUpdate(id, { name, attributes }, { new: true });
  },

  deleteInsuranceType: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    await models.InsuranceType.findByIdAndDelete(id);
    return true;
  },
};