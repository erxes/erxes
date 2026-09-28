import {
  getCustomDomainView,
  refreshCustomDomain,
  resetCustomDomain,
  saveCustomDomain,
} from '@/customdomain/service';
import { IContext } from '~/connectionResolvers';

export const customDomainMutations = {
  async frontlineCustomDomainSave(
    _root,
    { hostname }: { hostname: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    await saveCustomDomain(subdomain, hostname);

    return getCustomDomainView(subdomain);
  },

  async frontlineCustomDomainRefresh(
    _root,
    _args,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    await refreshCustomDomain(subdomain);

    return getCustomDomainView(subdomain);
  },

  async frontlineCustomDomainReset(
    _root,
    _args,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('helpCenterManage');

    await resetCustomDomain(subdomain);

    return getCustomDomainView(subdomain);
  },
};
