import { Users } from '../../../db/models';

export default {
  /**
   * Users list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted and filtered users objects
   */
  users(root, { limit }) {
    const users = Users.find({});
    const sort = { username: 1 };

    if (limit) {
      return users.limit(limit).sort(sort);
    }

    return users.sort(sort);
  },

  /**
   * Get one user
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found user
   */
  userDetail(root, { _id }) {
    return Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   * @return {Promise} total count
   */
  usersTotalCount() {
    return Users.find({}).count();
  },

  /**
   * Current user
   * @return {Promise} total count
   */
  currentUser(root, args, { user }) {
    return user;
  },
};
