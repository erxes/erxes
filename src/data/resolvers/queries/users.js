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

  userDetail(root, { _id }) {
    return Users.findOne({ _id });
  },

  usersTotalCount() {
    return Users.find({}).count();
  },
};
