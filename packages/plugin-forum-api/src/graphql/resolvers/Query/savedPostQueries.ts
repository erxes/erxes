import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { LoginRequiredError } from '../../../customErrors';

const savedPostQueries: IObjectTypeResolver<any, IContext> = {
  forumCpMySavedPosts(
    _,
    { limit = 0, offset = 0 },
    { models: { SavedPost }, cpUser }
  ) {
    if (!cpUser) throw new LoginRequiredError();

    return SavedPost.find({ cpUserId: cpUser.userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  },

  forumCpMySavedPostsCount(_, __, { models: { SavedPost }, cpUser }) {
    if (!cpUser) throw new LoginRequiredError();

    return SavedPost.countDocuments({ cpUserId: cpUser.userId });
  }
};

export default savedPostQueries;
