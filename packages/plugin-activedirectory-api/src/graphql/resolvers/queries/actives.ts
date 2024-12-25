import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const adQueries = {
  adConfigs: async (_root, params, { subdomain, models }: IContext) => {
    return models.AdConfig.findOne({ code: params.code });
  },
};

export default adQueries;
