import PosUsers from '../../../models/PosUsers';
import { IContext } from '../../types';

const userQueries = {
  /**
   * Current user
   */
  posCurrentUser(_root, _args, { posUser }: IContext) {
    return posUser
      ? PosUsers.findOne({ _id: posUser._id, isActive: { $ne: false } })
      : null;
  },

  posUsers(_root, param, { posUser }: IContext) {
    const query: any = { isActive: true };
    if (param.searchValue) {
      query.email = param.searchValue;
    }
    return PosUsers.find(query).lean();
  }
};

export default userQueries;
