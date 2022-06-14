import { IContext } from '../../../connectionResolver';
import { IApp } from '../../../db/models/definitions/apps';

interface IEditParams extends IApp {
  _id: string;
}

export default {
  async appsAdd(_root, params: IApp, { models }: IContext) {
    try {
      const app = await models.Apps.createApp(params);

      await models.Users.createSystemUser(app);

      return app;
    } catch (e) {
      throw new Error(e);
    }
  },
  appsEdit(
    _root,
    { _id, name, userGroupId }: IEditParams,
    { models }: IContext
  ) {
    return models.Apps.updateApp(_id, { name, userGroupId });
  },
  async appsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const app = await models.Apps.getApp(_id);

    await models.Users.deleteOne({ appId: app._id });

    return models.Apps.removeApp(_id);
  }
};
