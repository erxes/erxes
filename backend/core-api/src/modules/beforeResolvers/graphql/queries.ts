import { checkBeforeResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

type TBeforeResolverAvailableArgs = {
  resolver: string;
  args?: Record<string, unknown> | null;
};

export const beforeResolverQueries = {
  async beforeResolverAvailable(
    _root: undefined,
    { resolver, args }: TBeforeResolverAvailableArgs,
    { subdomain, user, req, requestInfo }: IContext,
  ) {
    return await checkBeforeResolvers(resolver, args || {}, {
      subdomain,
      user,
      headers: requestInfo?.headers || req?.headers,
    });
  },
};
