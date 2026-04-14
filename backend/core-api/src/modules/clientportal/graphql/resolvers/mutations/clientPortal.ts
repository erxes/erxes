import { IContext } from '~/connectionResolvers';
import { IClientPortal } from '@/clientportal/types/clientPortal';

export const clientPortalMutations = {
  async clientPortalAdd(
    _root: unknown,
    { name }: { name: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.createClientPortal(name);
  },
  async clientPortalUpdate(
    _root: unknown,
    { _id, clientPortal }: { _id: string; clientPortal: IClientPortal },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.updateClientPortal(_id, clientPortal);
  },

  async clientPortalDelete(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.findOneAndDelete({ _id });
  },

  async clientPortalChangeToken(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('clientPortalManage');

    return models.ClientPortal.clientPortalChangeToken(_id);
  },
};
