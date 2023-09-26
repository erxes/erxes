import { IContext } from '../../../messageBroker';

const pinnedUserMutations = {
  // /**
  //  * Creates a new pinnedUser
  //  */
  async meetingPinnedUserAdd(
    _root,
    { pinnedUserIds },
    { models, user }: IContext
  ) {
    return await models.PinnedUsers.createPinnedUser(pinnedUserIds, user);
  },

  // /**
  //  * Edits a pinnedUser
  //  */
  async meetingPinnedUserEdit(_root, doc, { models, user }: IContext) {
    return models.PinnedUsers.updatePinnedUser(doc, user);
  }
};

export default pinnedUserMutations;
