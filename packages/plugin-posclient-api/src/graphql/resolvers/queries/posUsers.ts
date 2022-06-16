import PosUsers from '../../../models/PosUsers';
import { IContext } from '../../types';

const userQueries = {
  /**
   * Current user
   */
  posCurrentUser(_root, models, _args, { posUser }: IContext) {
    return posUser
      ? models.PosUsers.findOne({ _id: posUser._id, isActive: { $ne: false } })
      : null;
  },

  posUsers(_root, models, param, { posUser }: IContext) {
    const query: any = { isActive: true };
    if (param.searchValue) {
      query.email = param.searchValue;
    }
    return models.PosUsers.find(query).lean();
  }
};

export default userQueries;
