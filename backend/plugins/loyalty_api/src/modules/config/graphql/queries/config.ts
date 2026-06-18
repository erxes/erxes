import { IContext } from '~/connectionResolvers';

export const loyaltyConfigQueries = {
  async loyaltyConfigs(
    _root: undefined,
    _params: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyConfigView');
    return models.LoyaltyConfigs.find({});
  },
};