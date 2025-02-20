import { IContext } from '../../../connectionResolver';
import { IApp } from '../../../db/models/definitions/apps';
import { debugError } from '../../../debuggers';

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
      debugError(`Error occurred when creating an app: ${e.message}`);

      throw new Error(e);
    }
  },
  async appsEdit(
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
  },

  // clientsAdd(name: String!, whiteListedIps: [String], permissions: [String]): Client
  // clientsEdit(_id: String!, name: String, whiteListedIps: [String], permissions: [String]): Client
  // clientsRemove(_id: String!): JSON

  async clientsAdd(_root, params: any, { models }: IContext) {
    const client = await models.Clients.createClient(params);

    return { clientId: client.clientId, clientSecret: client.clientSecret };
  },

  async clientsEdit(_root, params: any, { models }: IContext) {
    return models.Clients.updateClient(params);
  },


  async clientsRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Clients.removeClient(_id);
  },


};
