import { markResolvers } from 'erxes-api-shared/utils/apollo/wrapperResolvers';
import { IContext } from '~/connectionResolvers';

export const authQueries = {
  /**
   * Current user
   */
  async currentUser(
    _parent: undefined,
    _args: undefined,
    { user, models }: IContext,
  ) {
    const result = user
      ? await models.Users.findOne({ _id: user._id, isActive: { $ne: false } })
      : null;

    return result;
  },
};

markResolvers(authQueries, {
  skipPermission: true,
});