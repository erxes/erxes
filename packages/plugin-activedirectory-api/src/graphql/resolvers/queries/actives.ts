import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const adQueries = {
  adConfigs: async (_root, params, { models }: IContext) => {
    return models.AdConfig.findOne({ code: params.code });
  },
};

checkPermission(adQueries, 'adConfigs', 'manageAD');

export default adQueries;
