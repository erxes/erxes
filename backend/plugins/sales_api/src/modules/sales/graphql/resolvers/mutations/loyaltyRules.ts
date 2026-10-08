import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { ILoyaltyRule } from '~/modules/sales/@types';

export const loyaltyRuleMutations: Record<string, Resolver> = {
  async salesLoyaltyRulesSave(
    _root: undefined,
    { rules }: { rules: ILoyaltyRule[] },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('pipelinesEdit');

    return models.LoyaltyRules.saveLoyaltyRules(rules, user._id);
  },
};
