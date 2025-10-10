import { IContext } from '~/modules/posclient/@types/types';

const userQueries = {
  /**
   * Current user
   */
  async posCurrentUser(_root, _args, { models, posUser }: IContext) {
    return posUser
      ? models.PosUsers.findOne({ _id: posUser._id, isActive: { $ne: false } })
      : null;
  },

  async posUsers(_root, param, { models, posUser }: IContext) {
    const query: any = { isActive: true };
    if (param.searchValue) {
      query.email = param.searchValue;
    }
    return models.PosUsers.find(query).lean();
  },
};

export default userQueries;
