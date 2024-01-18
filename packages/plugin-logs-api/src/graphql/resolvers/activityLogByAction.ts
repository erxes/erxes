import { IActivityLogDocument } from '../../models/ActivityLogs';
import { getContentTypeDetail } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdUser(activityLog: IActivityLogDocument) {
    return (
      activityLog.createdBy && {
        __typename: 'User',
        _id: activityLog.createdBy,
      }
    );
  },

  contentTypeDetail(
    activityLog: IActivityLogDocument,
    _,
    { subdomain }: IContext,
  ) {
    return getContentTypeDetail(subdomain, activityLog);
  },
};
