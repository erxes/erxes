import { IContext } from "../../connectionResolver";
import { sendCoreMessage } from "../../messageBroker";
import { ISyncLogDocument } from "../../models/definitions/syncLog";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.SyncLogs.findOne({ _id });
  },

  async createdUser(syncLog: ISyncLogDocument, _, { subdomain }: IContext) {
    if (!syncLog.createdBy) {
      return;
    }

    return await sendCoreMessage({
      subdomain,
      action: "users.findOne",
      data: { _id: syncLog.createdBy },
      isRPC: true
    });
  },

  async content(syncLog: ISyncLogDocument, _, {}: IContext) {
    const { contentType, contentId } = syncLog;

    if (contentType === "sales:deal") {
      const info =
        syncLog.consumeData.updatedDocument ||
        syncLog.consumeData.object ||
        syncLog.consumeData;
      return info.number || info.name || contentId;
    }

    if (contentType === "pos:order") {
      return syncLog.consumeData.number || contentId;
    }

    if (contentType === "core:customer") {
      const info = syncLog.consumeData.object;
      return (
        info.code ||
        info.primaryEmail ||
        info.primaryPhone ||
        `${info.firstName || ""}${info.lastName && ` ${info.lastName}`}` ||
        contentId
      );
    }

    if (contentType === "core:company") {
      const info = syncLog.consumeData.object;
      return info.code || info.primaryName || contentId;
    }

    if (contentType === "core:product") {
      const info = syncLog.consumeData.object;
      return info.code || info.name || contentId;
    }

    if (contentType === "loans:transaction") {
      const info = syncLog.consumeData;
      return info.number || contentId;
    }

    return contentId;
  }
};
