import { IContext } from '../../connectionResolver';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Posts.findOne({ _id });
  },

  async author({ authorKind, authorId }, { models }: IContext) {
    if (authorKind === 'user') {
      return {
        _id: authorId,
        __typename: 'User',
      };
    } else if (authorKind === 'clientPortalUser') {
      return {
        _id: authorId,
        __typename: 'ClientPortalUser',
      }
    }
  },
};
