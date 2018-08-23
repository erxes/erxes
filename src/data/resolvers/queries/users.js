import { Users, Conversations } from '../../../db/models';
import { requireLogin } from '../../permissions';
import { paginate } from './utils';

const queryBuilder = async params => {
  let selector = {};

  if (params.searchValue) {
    const fields = [
      { 'details.fullName': new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.position': new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector = { $or: fields };
  }

  selector.isActive = { $ne: false };

  return selector;
};

const userQueries = {
  /**
   * Users list
   * @param {Object} args - Search params
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} sorted and filtered users objects
   */
  async users(root, args) {
    const selector = await queryBuilder(args);
    const users = paginate(Users.find(selector), args);

    return users.sort({ username: 1 });
  },

  /**
   * Get one user
   * @param {Object} args
   * @param {String} args._id
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} found user
   */
  userDetail(root, { _id }) {
    return Users.findOne({ _id, isActive: { $ne: false } });
  },

  /**
   * Get all users count. We will use it in pager
   * @param {Object} object3 - Graphql middleware data
   * @param {Object} object3.user - User making this request
   * @return {Promise} total count
   */
  async usersTotalCount(root, args) {
    const selector = await queryBuilder(args);

    return Users.find(selector).count();
  },

  /**
   * Current user
   * @return {Promise} total count
   */
  currentUser(root, args, { user }) {
    if (user) {
      return Users.findOne({ _id: user._id, isActive: { $ne: false } });
    }

    return null;
  },

  /**
   * Users conversations list
   * @param {Object} perPage - Display results per page
   * @param {Object} _id - User id
   * @return {Promise} sorted user conversations
   */
  userConversations(root, { _id, perPage }) {
    const selector = { participatedUserIds: { $in: [_id] } };

    const list = paginate(Conversations.find(selector), { perPage });
    const totalCount = Conversations.find(selector).count();

    return { list, totalCount };
  },
};

requireLogin(userQueries, 'users');
requireLogin(userQueries, 'userDetail');
requireLogin(userQueries, 'usersTotalCount');

export default userQueries;
