import { IContext } from '~/connectionResolvers';

export const clientPortalMutations = {
  async clientPortalAdd(
    _root: unknown,
    { name }: { name: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.createClientPortal(name);
  },
};
