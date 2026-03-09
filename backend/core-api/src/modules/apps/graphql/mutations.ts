import { IContext } from '~/connectionResolvers';
import { IApp } from 'erxes-api-shared/core-types';

export const appMutations = {
  async appsAdd(_parent: undefined, params: IApp, { models }: IContext) {
    return models.Apps.createApp(params);
  },

  async appsEdit(
    _parent: undefined,
    { _id, name }: { _id: string; name: string },
    { models }: IContext,
  ) {
    return models.Apps.updateApp(_id, { name });
  },

  async appsRevoke(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Apps.revokeApp(_id);
  },

  async appsRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Apps.removeApp(_id);
  },
};
