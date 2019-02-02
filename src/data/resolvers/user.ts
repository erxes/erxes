import { IUserDocument } from '../../db/models/definitions/users';

export default {
  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Pending Invitation';
    }

    return 'Verified';
  },
};
