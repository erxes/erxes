import { IContext } from "../../../connectionResolver";

interface IAppParams {
  name: string;
  userGroupId: string;
}

interface IEditParams extends IAppParams {
  _id: string;
}

export default {
  appsAdd(_root, params: IAppParams, { models }: IContext) {
    return models.Apps.createApp(params);
  },
  appsEdit(_root, { _id, name, userGroupId }: IEditParams, { models }: IContext) {
    return models.Apps.updateApp(_id, { name, userGroupId });
  },
  appsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Apps.removeApp(_id);
  }
};
