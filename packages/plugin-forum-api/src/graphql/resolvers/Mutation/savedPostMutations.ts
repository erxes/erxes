import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const savedPostMutations: IObjectTypeResolver<any, IContext> = {
  async forumCpPostSave(_, { postId }, { models: { SavedPost }, cpUser }) {
    return SavedPost.savePost(postId, cpUser);
  },
  async forumCpPostUnsave(_, { postId }, { models: { SavedPost }, cpUser }) {
    return SavedPost.unsavePost(postId, cpUser);
  },
  async forumCpSavedPostDelete(_, { _id }, { models: { SavedPost }, cpUser }) {
    return SavedPost.deleteSavedPost(_id, cpUser);
  }
};

export default savedPostMutations;
