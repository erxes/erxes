import { Conversations, Users } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { requireLogin } from '../../permissions';
import { paginate } from './utils';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
  isActive?: boolean;
}

const queryBuilder = async (params: IListArgs) => {
  const selector: any = {};

  if (params.searchValue) {
    const fields = [
      { 'details.fullName': new RegExp(`.*${params.searchValue}.*`, 'i') },
      { 'details.position': new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector.$or = fields;
  }

  if (params.isActive !== undefined) {
    selector.isActive = params.isActive;
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
  currentUser(_root, _args, { user }: { user: IUserDocument }) {
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

requireLogin(userQueries, 'users');
requireLogin(userQueries, 'userDetail');
requireLogin(userQueries, 'usersTotalCount');

export default userQueries;
