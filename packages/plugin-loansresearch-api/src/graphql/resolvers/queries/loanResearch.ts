import { IContext } from '../../../connectionResolver';

const lsQueries = {
  adConfigs: async (_root, params, { subdomain, models }: IContext) => {
    return models.AdConfig.findOne({ code: params.code });
  },
};

export default lsQueries;
