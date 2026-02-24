import { IContext } from '~/connectionResolvers';

export const insuranceTypeQueries = {
  insuranceTypes: async (
    _parent: undefined,
    _args: any,
    { models }: IContext,
  ) => {
    return models.InsuranceType.find({});
  },

  insuranceType: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    return models.InsuranceType.findById(id);
  },
};
