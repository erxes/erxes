import { IActivityLogDocument } from "../../models/ActivityLogs";
import messageBroker, { getActivityContentItem, getContentTypeDetail } from '../../messageBroker';

export default {
  async createdByDetail(activityLog: IActivityLogDocument) {
    const detail = await messageBroker().sendRPCMessage('core:rpc_queue:createdByDetail', { activityLog });

    return detail;
  },

  contentTypeDetail(activityLog: IActivityLogDocument) {
    return getContentTypeDetail(activityLog);
  },

  async contentDetail(activityLog: IActivityLogDocument) {
    const response = await getActivityContentItem(activityLog);

    return response;
  }
};
