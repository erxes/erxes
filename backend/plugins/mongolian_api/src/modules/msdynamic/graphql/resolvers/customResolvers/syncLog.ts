import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ISyncLogDocument } from '~/modules/msdynamic/@types/dynamic';
import { IContext } from '~/connectionResolvers';

export default {
  SyncMsdHistory: {
    async __resolveReference({ _id }: { _id: string }, { models }: IContext) {
      return models.SyncLogs.findOne({ _id });
    },

    async createdUser(
      syncLog: ISyncLogDocument,
      _args: any,
      { subdomain }: IContext,
    ) {
      if (!syncLog.createdBy) {
        return null;
      }

      return sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: syncLog.createdBy },
        defaultValue: null,
      });
    },

    async content(syncLog: ISyncLogDocument, _args: any, _context: IContext) {
      const { contentType, contentId } = syncLog;

      if (contentType === 'sales:deal') {
        return (
          syncLog.consumeData?.object?.name?.split(':')?.pop()?.trim() ||
          contentId
        );
      }

      if (contentType === 'pos:order') {
        return (
          syncLog.consumeData?.number ||
          syncLog.consumeData?.object?.number ||
          contentId
        );
      }

      if (contentType === 'core:customer') {
        const info =
          syncLog.consumeData?.object || syncLog.consumeData?.customer;

        return (
          info?.code ||
          info?.primaryEmail ||
          info?.primaryPhone ||
          `${info?.firstName || ''}${
            info?.lastName ? ` ${info.lastName}` : ''
          }` ||
          contentId
        );
      }

      if (contentType === 'core:company') {
        const info =
          syncLog.consumeData?.object || syncLog.consumeData?.company;

        return info?.code || info?.primaryName || contentId;
      }

      return contentId;
    },
  },
};
