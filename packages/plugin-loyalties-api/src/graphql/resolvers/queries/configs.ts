import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const loyaltyConfigQueries = {
  loyaltyConfigs(_root, _params, { models }: IContext) {
    return models.LoyaltyConfigs.find({});
  }
};

checkPermission(loyaltyConfigQueries, 'loyaltyConfigs', 'manageLoyalties');

export default loyaltyConfigQueries;
