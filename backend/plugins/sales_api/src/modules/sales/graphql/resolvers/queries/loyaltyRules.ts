import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const loyaltyRuleQueries: Record<string, Resolver> = {
  async salesLoyaltyRules(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.LoyaltyRules.find({}).sort({ createdAt: 1 }).lean();
  },
};
