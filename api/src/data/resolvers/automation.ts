import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(automation: any) {
    return getDocument('users', { _id: automation.createdBy || '' });
  },

  updatedUser(automation: any) {
    return getDocument('users', { _id: automation.updatedBy || '' });
  }
};
