import { Users } from '../../../db/models';

export default {
  users(root, { limit }) {
    const users = Users.find({});

    if (limit) {
      return users.limit(limit);
    }

    return users;
  },

  totalUsersCount() {
    return Users.find({}).count();
  },
};
