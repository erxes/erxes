import { IActivityLogDocument } from '../../models/ActivityLogs';
import { getContentTypeDetail } from '../../messageBroker';

export default {
  async createdUser(activityLog: IActivityLogDocument) {
    return (
      activityLog.createdBy && {
        __typename: 'User',
        _id: activityLog.createdBy
      }
    );
  },

  contentTypeDetail(activityLog: IActivityLogDocument) {
    return getContentTypeDetail(activityLog);
  }
};
