import { IContext } from '~/connectionResolvers';

export const loyaltyConfigQueries = {
  async loyaltyConfigs(
    _root: undefined,
    _params: undefined,
    { models }: IContext,
  ) {
    return models.LoyaltyConfigs.find({});
  },
};
