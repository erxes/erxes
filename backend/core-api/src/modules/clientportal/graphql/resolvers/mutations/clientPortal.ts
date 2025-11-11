import { IContext } from '~/connectionResolvers';

export const clientPortalMutations = {
  async clientPortalCreate(
    _root: unknown,
    { name }: { name: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.create({ name });
  },
};
