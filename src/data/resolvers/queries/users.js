import { Users } from '../../../db/models';
import { BasicPermissions } from './utils';

const users = {
  /**
   * Users list
   * @param {Object} args
   * @param {Integer} args.limit
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} sorted and filtered users objects
   */
  users(root, { limit }, { user }) {
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
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} found user
   */
  userDetail(root, { _id }, { user }) {
    if (!user) {
      return {};
    }

    return Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} total count
   */
  usersTotalCount(root, object2, { user }) {
    if (!user) {
      return 0;
    }

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

BasicPermissions.setPermissionsForList(users, 'users');
console.log('users.users: ', users.users);

export default users;
