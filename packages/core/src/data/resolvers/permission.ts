import { IContext } from '../../connectionResolver';
import { IPermissionDocument } from '../../db/models/definitions/permissions';
import { getDocument } from './mutations/cacheUtils';

export default {
  user(entry: IPermissionDocument, _args, { models }: IContext) {
    return getDocument(models, 'users', { _id: entry.userId });
  },

  group(entry: IPermissionDocument, _args, { models }: IContext) {
    return models.UsersGroups.findOne({ _id: entry.groupId });
  }
};
