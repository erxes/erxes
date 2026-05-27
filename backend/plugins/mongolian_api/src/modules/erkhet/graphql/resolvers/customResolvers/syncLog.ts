import { IContext } from '~/connectionResolvers';
import { ISyncLogDocument } from '~/modules/erkhet/@types/syncLog';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async __resolveReference({ _id }: ISyncLogDocument, { models }: IContext) {
    return models.SyncLogs.findOne({ _id });
  },

  async createdUser(
    { createdBy }: ISyncLogDocument,
    _args: any,
    { subdomain }: IContext,
  ) {
    if (!createdBy) {
      return;
    }

    return await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      method: 'query',
      input: { _id: createdBy },
      defaultValue: null,
    });
  },

  async content({ contentType, contentId, consumeData }: ISyncLogDocument) {
    if (contentType === 'sales:deal') {
      const info =
        consumeData.updatedDocument || consumeData.object || consumeData;
      return info.number || info.name || contentId;
    }

    if (contentType === 'purchases:purchase') {
      const info =
        consumeData.updatedDocument || consumeData.object || consumeData;
      return info.number || info.name || contentId;
    }

    if (contentType === 'pos:order') {
      return consumeData.number || contentId;
    }

    if (contentType === 'core:customer') {
      const info = consumeData.object;
      return (
        info.code ||
        info.primaryEmail ||
        info.primaryPhone ||
        `${info.firstName || ''}${info.lastName && ` ${info.lastName}`}` ||
        contentId
      );
    }

    if (contentType === 'core:company') {
      const info = consumeData.object;
      return info.code || info.primaryName || contentId;
    }

    if (contentType === 'core:product') {
      const info = consumeData.object;
      return info.code || info.name || contentId;
    }

    if (contentType === 'loans:transaction') {
      const info = consumeData;
      return info.number || contentId;
    }

    if (contentType === 'core:user') {
      const info = consumeData.object;
      return info.email || contentId;
    }

    return contentId;
  },
};
