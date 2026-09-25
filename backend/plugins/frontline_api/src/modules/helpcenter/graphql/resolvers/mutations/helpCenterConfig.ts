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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    return models.HelpCenterConfigs.removeConfig(_id);
  },
};
