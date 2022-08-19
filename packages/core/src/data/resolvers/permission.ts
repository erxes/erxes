import { IContext } from '../../connectionResolver';
import { IPermissionDocument } from '../../db/models/definitions/permissions';

export default {
  user(entry: IPermissionDocument, _args, { models }: IContext) {
    return models.Users.findOne({
      _id: entry.userId
    });
  },

  group(entry: IPermissionDocument, _args, { models }: IContext) {
    return models.UsersGroups.findOne({ _id: entry.groupId });
  }
};
