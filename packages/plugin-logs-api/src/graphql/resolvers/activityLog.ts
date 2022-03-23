import { IActivityLogDocument } from '../../models/ActivityLogs';
import { getActivityContentItem, getContentTypeDetail } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdByDetail(activityLog: IActivityLogDocument, _args, { coreModels }: IContext) {
    const user = await coreModels.Users.findOne({ _id: activityLog.createdBy });

    return { type: 'user', content: user };
  },

  contentTypeDetail(activityLog: IActivityLogDocument) {
    return getContentTypeDetail(activityLog);
  },

  async contentDetail(activityLog: IActivityLogDocument) {
    const response = await getActivityContentItem(activityLog);

    return response;
  },
};
