import { IContext } from '~/connectionResolvers';
import { IClientPortal } from '~/modules/clientportal/types/clientPortal';

export const clientPortalMutations = {
  async clientPortalAdd(
    _root: unknown,
    { name }: { name: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.createClientPortal(name);
  },
  async clientPortalUpdate(
    _root: unknown,
    { _id, clientPortal }: { _id: string; clientPortal: IClientPortal },
    { models }: IContext,
  ) {
    return models.ClientPortal.updateClientPortal(_id, clientPortal);
  },

  async clientPortalDelete(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.findOneAndDelete({ _id });
  },

  async clientPortalChangeToken(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.clientPortalChangeToken(_id);
  },
};
