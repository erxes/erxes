import { IContext } from '../../connectionResolver';
import { ISyncLogDocument } from '../../models/definitions/syncLog';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.SyncLogs.findOne({ _id });
  },

  async content(syncLog: ISyncLogDocument, _, {}: IContext) {
    const { contentType, contentId } = syncLog;

    if (contentType === 'cards:deal') {
      const info =
        syncLog.consumeData.updatedDocument ||
        syncLog.consumeData.object ||
        syncLog.consumeData;
      return info.number || info.name || contentId;
    }

    if (contentType === 'cards:purchase') {
      const info =
        syncLog.consumeData.updatedDocument ||
        syncLog.consumeData.object ||
        syncLog.consumeData;
      return info.number || info.name || contentId;
    }

    if (contentType === 'pos:order') {
      return syncLog.consumeData.number || contentId;
    }

    if (contentType === 'contacts:customer') {
      const info = syncLog.consumeData.object;
      return (
        info.code ||
        info.primaryEmail ||
        info.primaryPhone ||
        `${info.firstName || ''}${info.lastName && ` ${info.lastName}`}` ||
        contentId
      );
    }

    if (contentType === 'contacts:company') {
      const info = syncLog.consumeData.object;
      return info.code || info.primaryName || contentId;
    }

    if (contentType === 'products:product') {
      const info = syncLog.consumeData.object;
      return info.code || info.name || contentId;
    }

    if (contentType === 'loans:transaction') {
      const info = syncLog.consumeData;
      return info.number || contentId;
    }

    if (contentType === 'core:user') {
      const info = syncLog.consumeData.object;
      return info.email || contentId;
    }

    return contentId;
  }
};
