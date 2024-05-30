import { IContext } from '../../connectionResolver';
import { IPermissionDocument } from '../../db/models/definitions/permissions';

export default {
  async user(entry: IPermissionDocument, _args, { models }: IContext) {
    return models.Users.findOne({
      _id: entry.userId
    });
  },

  async group(entry: IPermissionDocument, _args, { models }: IContext) {
    return models.UsersGroups.findOne({ _id: entry.groupId });
  }
};
