import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const adMutations = {
  adConfigUpdate: async (_root, doc, { models, subdomain }: IContext) => {
    const config = await models.AdConfig.createOrUpdateConfig(doc);
    return config;
  },
};

checkPermission(adMutations, 'adConfigUpdate', 'manageAD');

export default adMutations;
