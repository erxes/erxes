import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(activityLog: any) {
    return getDocument('users', { _id: activityLog.createdBy });
  }
};
