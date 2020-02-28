import { Brands } from '../../db/models';
import { IUserDocument } from '../../db/models/definitions/users';
import { getUserActionsMap } from '../permissions/utils';
import { getConfigs } from '../utils';

export default {
  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Not verified';
    }

    return 'Verified';
  },

  brands(user: IUserDocument) {
    if (user.isOwner) {
      return Brands.find({});
    }

    return Brands.find({ _id: { $in: user.brandIds } });
  },

  async permissionActions(user: IUserDocument) {
    return getUserActionsMap(user);
  },

  async configs() {
    return getConfigs();
  },
};
