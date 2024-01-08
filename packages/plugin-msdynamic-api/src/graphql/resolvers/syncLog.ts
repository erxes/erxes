import { IContext, sendCoreMessage } from '../../messageBroker';
import { ISyncLogDocument } from '../../models/definitions/dynamic';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.SyncLogs.findOne({ _id });
  },

  async createdUser(syncLog: ISyncLogDocument, _, { subdomain }: IContext) {
    if (!syncLog.createdBy) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: syncLog.createdBy },
      isRPC: true
    });
  }
};
