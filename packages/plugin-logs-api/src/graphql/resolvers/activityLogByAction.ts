import { IActivityLogDocument } from '../../models/ActivityLogs';
import messageBroker, { getContentTypeDetail } from '../../messageBroker';

export default {
  createdUser(activityLog: IActivityLogDocument) {
    return messageBroker().sendRPCMessage('core:rpc_queue:findOneUser', { _id: activityLog.createdBy });
  },

  contentTypeDetail(activityLog: IActivityLogDocument) {
    return getContentTypeDetail(activityLog);
  },
};
