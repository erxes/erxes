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
  },

  async content(syncLog: ISyncLogDocument, _, {}: IContext) {
    const { contentType, contentId } = syncLog;

    if (contentType === 'pos:order') {
      return syncLog.consumeData.number || contentId;
    }

    if (contentType === 'contacts:customer') {
      const info = syncLog.consumeData.object || syncLog.consumeData.customer;

      return (
        info.code ||
        info.primaryEmail ||
        info.primaryPhone ||
        `${info.firstName || ''}${info.lastName && ` ${info.lastName}`}` ||
        contentId
      );
    }

    if (contentType === 'contacts:company') {
      const info = syncLog.consumeData.object || syncLog.consumeData.company;
      return info.code || info.primaryName || contentId;
    }

    return contentId;
  }
};
