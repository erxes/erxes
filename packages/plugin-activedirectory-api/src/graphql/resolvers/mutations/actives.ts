import { IContext } from '../../../connectionResolver';

const adMutations = {
  adConfigUpdate: async (_root, doc, { models, subdomain }: IContext) => {
    const config = await models.AdConfig.createOrUpdateConfig(doc);
    return config;
  },
};

export default adMutations;
