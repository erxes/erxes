import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

const loyaltyConfigQueries = {
  async loyaltyConfigs(_root, _params, { models }: IContext) {
    return models.LoyaltyConfigs.find({});
  },
};

checkPermission(loyaltyConfigQueries, 'loyaltyConfigs', 'manageLoyalties');

export default loyaltyConfigQueries;
