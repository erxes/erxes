import { Users, UsersGroups } from '../../db/models';
import { IPermissionDocument } from '../../db/models/definitions/permissions';

export default {
  user(entry: IPermissionDocument) {
    return Users.findOne({ _id: entry.userId });
  },

  group(entry: IPermissionDocument) {
    return UsersGroups.findOne({ _id: entry.groupId });
  }
};
