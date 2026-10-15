import {
  getCustomDomainView,
  refreshCustomDomain,
  resetCustomDomain,
  saveCustomDomain,
} from '@/customdomain/service';
import { IContext, IModels } from '~/connectionResolvers';

export const assertHelpCenter = async (
  models: IModels,
  helpCenterId: string,
) => {
  if (!(await models.HelpCenterConfigs.exists({ _id: helpCenterId }))) {
    throw new Error('Help center not found');
  }
};

export const customDomainMutations = {
  async frontlineCustomDomainSave(
    _root,
    { helpCenterId, hostname }: { helpCenterId: string; hostname: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');
    await assertHelpCenter(models, helpCenterId);

    await saveCustomDomain(models, subdomain, helpCenterId, hostname);

    return getCustomDomainView(models, subdomain, helpCenterId);
  },

  async frontlineCustomDomainRefresh(
    _root,
    { helpCenterId }: { helpCenterId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');
    await assertHelpCenter(models, helpCenterId);

    await refreshCustomDomain(models, subdomain, helpCenterId);

    return getCustomDomainView(models, subdomain, helpCenterId);
  },

  async frontlineCustomDomainReset(
    _root,
    { helpCenterId }: { helpCenterId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');
    await assertHelpCenter(models, helpCenterId);

    await resetCustomDomain(models, subdomain, helpCenterId);

    return getCustomDomainView(models, subdomain, helpCenterId);
  },
};
