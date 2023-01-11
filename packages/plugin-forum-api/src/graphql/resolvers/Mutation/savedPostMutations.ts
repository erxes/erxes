import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const savedPostMutations: IObjectTypeResolver<any, IContext> = {
  forumCpPostSave(_, { postId }, { models: { SavedPost }, cpUser }) {
    return SavedPost.savePost(postId, cpUser);
  },
  forumCpPostUnsave(_, { postId }, { models: { SavedPost }, cpUser }) {
    return SavedPost.unsavePost(postId, cpUser);
  },
  forumCpSavedPostDelete(_, { postId }, { models: { SavedPost }, cpUser }) {
    return SavedPost.deleteSavedPost(postId, cpUser);
  }
};

export default savedPostMutations;
