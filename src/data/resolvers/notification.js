import { Users } from '../../db/models';

export default {
  createdUser(notif) {
    return Users.findOne({ _id: notif.createdUser });
  },
};
