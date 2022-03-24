import { IActivityLogDocument } from '../../models/ActivityLogs';
import {
  fetchService,
  getActivityContentItem,
  getContentTypeDetail
} from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdByDetail(
    activityLog: IActivityLogDocument,
    _args,
    { coreModels }: IContext
  ) {
    const user = await coreModels.Users.findOne({ _id: activityLog.createdBy });

    return { type: 'user', content: user };
  },

  async contentTypeDetail(activityLog: IActivityLogDocument) {
    const { contentType } = activityLog;

    return fetchService(contentType, 'getContentTypeDetail', activityLog, '');
  },

  async contentDetail(activityLog: IActivityLogDocument) {
    const { contentType } = activityLog;

    return fetchService(contentType, 'getActivityContent', activityLog, '');
  }
};
