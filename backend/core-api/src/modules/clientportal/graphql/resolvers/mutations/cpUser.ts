import { IContext } from '~/connectionResolvers';
import { ICPUserRegisterParams } from '@/clientportal/types/cpUser';
import { Resolver } from 'erxes-api-shared/core-types';

export const cpUserMutations: Record<string, Resolver> = {
  async clientPortalUserRegister(
    _root: unknown,
    params: ICPUserRegisterParams,
    { models, subdomain, clientPortal }: IContext,
  ) {
    return models.CPUser.registerUser(subdomain, clientPortal, params);
  },
};

cpUserMutations.clientPortalUserRegister.wrapperConfig = {
  forClientPortal: true,
};
