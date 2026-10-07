import { isCustomDomainAvailable } from '@/customdomain/constants';
import { resetCustomDomain } from '@/customdomain/service';
import { IHelpCenterConfigInput } from '@/helpcenter/@types/helpCenterConfig';
import { withClientPortalFields } from '@/helpcenter/utils/clientPortal';
import { IContext } from '~/connectionResolvers';

export const helpCenterConfigMutations = {
  async helpCenterConfigUpdate(
    _root,
    { config }: { config: IHelpCenterConfigInput },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    return models.HelpCenterConfigs.createOrUpdateConfig(
      await withClientPortalFields(subdomain, config),
      user._id,
    );
  },

  async helpCenterConfigRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    // Its domain would otherwise stay registered on Cloudflare with nothing
    // to serve.
    if (isCustomDomainAvailable()) {
      await resetCustomDomain(models, subdomain, _id);
    }

    return models.HelpCenterConfigs.removeConfig(_id);
  },
};
