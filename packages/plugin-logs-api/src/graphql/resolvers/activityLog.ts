import { IActivityLogDocument } from '../../models/ActivityLogs';
import { fetchService, sendCoreMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdByDetail(
    activityLog: IActivityLogDocument,
    _args,
    { subdomain }: IContext
  ) {
    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: activityLog.createdBy
      },
      isRPC: true
    });

    return { type: 'user', content: user };
  },

  async contentTypeDetail(activityLog: IActivityLogDocument) {
    const { contentType } = activityLog;

    let result = '';

    try {
      result = await fetchService(
        contentType,
        'getContentTypeDetail',
        activityLog,
        ''
      );
    } catch (e) {
      return result;
    }

    return result;
  },

  async contentDetail(activityLog: IActivityLogDocument) {
    const { contentType } = activityLog;

    let result = '';

    try {
      result = await fetchService(
        contentType,
        'getActivityContent',
        activityLog,
        ''
      );
    } catch (e) {
      return result;
    }

    return result;
  }
};
