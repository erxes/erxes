import { Brands } from '../../db/models';
import { IUserDocument } from '../../db/models/definitions/users';
import { getUserActionsMap } from '../permissions/utils';

export default {
  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Pending Invitation';
    }

    return 'Verified';
  },

  brands(user: IUserDocument) {
    return Brands.find({ _id: { $in: user.brandIds } });
  },

  async permissionActions(user: IUserDocument) {
    return getUserActionsMap(user);
  },
};
