import { IStatus, IStatusEditInput } from '@/status/@types/status';
import { IContext } from '~/connectionResolvers';

export const statusMutations = {
  addStatus: async (
    _parent: undefined,
    params: IStatus,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusCreate');

    return models.Status.addStatus(params);
  },

  updateStatus: async (
    _parent: undefined,
    { _id, ...params }: IStatusEditInput,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusUpdate');

    return models.Status.updateStatus(_id, params);
  },

  deleteStatus: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusRemove');

    return models.Status.removeStatus(_id);
  },
};
