import Apps from '../../../db/models/Apps';

interface IAppParams {
  name: string;
  userGroupId: string;
}

interface IEditParams extends IAppParams {
  _id: string;
}

export default {
  appsAdd(_root, params: IAppParams) {
    return Apps.createApp(params);
  },
  appsEdit(_root, { _id, name, userGroupId }: IEditParams) {
    return Apps.updateApp(_id, { name, userGroupId });
  },
  appsRemove(_root, { _id }: { _id: string }) {
    return Apps.removeApp(_id);
  }
};
