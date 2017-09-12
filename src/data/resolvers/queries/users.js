import { Users } from '../../../db/models';

export default {
  users(root, { limit }) {
    const users = Users.find({});
    const sort = { username: 1 };

    if (limit) {
      return users.limit(limit).sort(sort);
    }

    return users.sort(sort);
  },

  totalUsersCount() {
    return Users.find({}).count();
  },
};
