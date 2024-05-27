import {
  getOrgPromoCodes,
  getOrganizationDetail,
  getPlugins,
} from '@erxes/api-utils/src/saas/saas';
import { IContext } from '../../../connectionResolver';
import { calcUsage } from '@erxes/api-utils/src/saas/chargeUtils';

const chargeQueries = {
  async getCreditsInfo(_root, _params, { models, subdomain }: IContext) {
    const plugins = await getPlugins({
      comingSoon: { $ne: true },
    });

    const currentOrganization = await getOrganizationDetail({
      subdomain,
      models,
    });

    const orgPromoCodes = await getOrgPromoCodes(currentOrganization);

    for (const plugin of plugins) {
      plugin.usage = await calcUsage({
        subdomain,
        pluginType: plugin.type,
        organization: currentOrganization,
        orgPromoCodes,
      });
    }

    return plugins;
  },

  async chargeCurrentOrganization(_root, {}, { subdomain, models }: IContext) {
    return getOrganizationDetail({ subdomain, models });
  },
};

export default chargeQueries;
