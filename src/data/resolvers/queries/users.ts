import { Conversations, Users } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
  isActive?: boolean;
  ids?: string[];
  email?: string;
  status?: string;
}

const queryBuilder = async (params: IListArgs) => {
  const { searchValue, isActive, ids, status } = params;

  const selector: any = {
    isActive,
  };

  if (searchValue) {
    const fields = [
      { email: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.fullName': new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.position': new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector.$or = fields;
  }

  if (isActive === undefined || isActive === null) {
    selector.isActive = true;
  }

  if (ids) {
    return { _id: { $in: ids } };
  }

  if (status) {
    selector.registrationToken = { $eq: null };
  }

  return selector;
};

const userQueries = {
  /**
   * Users list
   */
  async users(_root, args: IListArgs) {
    const selector = await queryBuilder(args);
    const sort = { username: 1 };

    return paginate(Users.find(selector).sort(sort), args);
  },

  /**
   * All users
   */
  allUsers() {
    const sort = { username: 1 };

    return Users.find().sort(sort);
  },

  /**
   * Get one user
   */
  userDetail(_root, { _id }: { _id: string }) {
    return Users.findOne({ _id });
  },

  /**
   * Get all users count. We will use it in pager
   */
  async usersTotalCount(_root, args: IListArgs) {
    const selector = await queryBuilder(args);

    return Users.find(selector).countDocuments();
  },

  /**
   * Current user
   */
  currentUser(_root, _args, { user }: IContext) {
    if (user) {
      return Users.findOne({ _id: user._id, isActive: { $ne: false } });
    }

    return null;
  },

  /**
   * Users conversations list
   */
  userConversations(_root, { _id, perPage }: { _id: string; perPage: number }) {
    const selector = { participatedUserIds: { $in: [_id] } };

    const list = paginate(Conversations.find(selector), { perPage });
    const totalCount = Conversations.find(selector).countDocuments();

    return { list, totalCount };
  },
};

requireLogin(userQueries, 'usersTotalCount');
requireLogin(userQueries, 'userDetail');

checkPermission(userQueries, 'users', 'showUsers', []);

export default userQueries;
