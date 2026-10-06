import { assertHelpCenter } from '@/customdomain/graphql/resolvers/mutations';
import {
  checkActiveDomainOnOpen,
  getCustomDomainView,
} from '@/customdomain/service';
import { IContext } from '~/connectionResolvers';

export const customDomainQueries = {
  async frontlineCustomDomain(
    _root,
    { helpCenterId }: { helpCenterId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('showHelpCenter');
    await assertHelpCenter(models, helpCenterId);

    await checkActiveDomainOnOpen(models, subdomain, helpCenterId);

    return getCustomDomainView(models, subdomain, helpCenterId);
  },
};
