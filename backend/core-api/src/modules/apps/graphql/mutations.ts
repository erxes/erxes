import { IContext } from '~/connectionResolvers';
import { IApp } from 'erxes-api-shared/core-types';

export const appMutations = {
  async appsAdd(_parent: undefined, params: IApp, { models }: IContext) {
    try {
      const app = await models.Apps.createApp(params);

      await models.Users.createSystemUser(app);

      return app;
    } catch (e) {
      throw new Error('appsAdd error');
    }
  },
  async appsEdit(
    _parent: undefined,
    { _id, name, userGroupId }: any,
    { models }: IContext,
  ) {
    return models.Apps.updateApp(_id, { name, userGroupId });
  },
  async appsRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const app = await models.Apps.getApp(_id);

    await models.Users.deleteOne({ appId: app._id });

    return models.Apps.removeApp(_id);
  },
};
