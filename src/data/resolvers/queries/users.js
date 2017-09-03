import { Users } from '../../../db/models';

export default {
  users(root, { limit }) {
    return Users.find({}).limit(limit);
  },

  totalUsersCount() {
    return Users.find({}).count();
  },
};
