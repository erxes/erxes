import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(note: any) {
    return getDocument('users', { _id: note.createdBy });
  }
};
