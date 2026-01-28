import { IContext } from '~/connectionResolvers';

export const loyaltyConfigQueries = {
  loyaltyConfigs: async (
    _parent: undefined,
    _params: {},
    { models }: IContext,
  ) => {
    return models.LoyaltyConfig.find().lean();
  },
};
