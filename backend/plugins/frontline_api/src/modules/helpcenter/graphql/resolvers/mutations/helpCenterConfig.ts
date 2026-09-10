import { IHelpCenterConfigInput } from '@/helpcenter/@types/helpCenterConfig';
import { IContext } from '~/connectionResolvers';

export const helpCenterConfigMutations = {
  async helpCenterConfigUpdate(
    _root,
    { config }: { config: IHelpCenterConfigInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    return models.HelpCenterConfigs.createOrUpdateConfig(config, user._id);
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
