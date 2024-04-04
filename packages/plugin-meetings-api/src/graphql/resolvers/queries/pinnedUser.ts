import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../messageBroker';

const pinnedUserQueries = {
  async meetingPinnedUsers(_root, {}, { models, user }: IContext) {
    return await paginate(models.PinnedUsers.findOne({ userId: user._id }), {});
  }
};

export default pinnedUserQueries;
