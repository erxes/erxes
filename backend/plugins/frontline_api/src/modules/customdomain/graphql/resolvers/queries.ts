import {
  checkActiveDomainOnOpen,
  getCustomDomainView,
} from '@/customdomain/service';
import { IContext } from '~/connectionResolvers';

export const customDomainQueries = {
  async frontlineCustomDomain(
    _root,
    _args,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('showHelpCenter');

    await checkActiveDomainOnOpen(subdomain);

    return getCustomDomainView(subdomain);
  },
};
