import { IContext } from '../../../messageBroker';

const pinnedUserMutations = {
  // /**
  //  * Creates a new pinnedUser
  //  */

  // /**
  //  * Edits a pinnedUser
  //  */
  async meetingPinnedUserUpdate(
    _root,
    { pinnedUserIds },
    { models, user }: IContext
  ) {
    return models.PinnedUsers.updatePinnedUser(pinnedUserIds, user);
  }
};

export default pinnedUserMutations;
