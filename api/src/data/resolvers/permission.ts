import { UsersGroups } from '../../db/models';
import { IPermissionDocument } from '../../db/models/definitions/permissions';
import { getDocument } from './mutations/cacheUtils';

export default {
  user(entry: IPermissionDocument) {
    return getDocument('users', { _id: entry.userId });
  },

  group(entry: IPermissionDocument) {
    return UsersGroups.findOne({ _id: entry.groupId });
  }
};
