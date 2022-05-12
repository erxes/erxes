import { IContext } from '../../../connectionResolver';

interface IAppParams {
  name: string;
  userGroupId: string;
}

interface IEditParams extends IAppParams {
  _id: string;
}

export default {
  async appsAdd(_root, params: IAppParams, { models }: IContext) {
    const app = await models.Apps.createApp(params);

    await models.Users.createSystemUser(app);

    return app;
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
