import { IActivityLogDocument } from '../../models/ActivityLogs';
import { getContentTypeDetail } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdUser(activityLog: IActivityLogDocument, _args, { coreModels }: IContext) {
    const user = await coreModels.Users.findOne({ _id: activityLog.createdBy });

    return user;
  },

  contentTypeDetail(activityLog: IActivityLogDocument) {
    return getContentTypeDetail(activityLog);
  },
};
