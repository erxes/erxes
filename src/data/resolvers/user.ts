import { IUserDocument } from '../../db/models/definitions/users';
import { getUserAllowedActions } from '../permissions/utils';

export default {
  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Pending Invitation';
    }

    return 'Verified';
  },

  async permissionActions(user: IUserDocument) {
    return getUserAllowedActions(user);
  },
};
