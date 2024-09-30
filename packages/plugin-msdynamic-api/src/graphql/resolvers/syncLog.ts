import { IContext, sendCoreMessage } from "../../messageBroker";
import { ISyncLogDocument } from "../../models/definitions/dynamic";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.SyncLogs.findOne({ _id });
  },

  async createdUser(syncLog: ISyncLogDocument, {}, { subdomain }: IContext) {
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

  async content(syncLog: ISyncLogDocument, {}, {}: IContext) {
    const { contentType, contentId } = syncLog;

    if (contentType === "pos:order") {
      return (
        syncLog.consumeData?.number ||
        syncLog.consumeData?.object?.number ||
        contentId
      );
    }

    if (contentType === "core:customer") {
      const info = syncLog.consumeData.object || syncLog.consumeData.customer;

      return (
        info.code ||
        info.primaryEmail ||
        info.primaryPhone ||
        `${info.firstName || ""}${info.lastName && ` ${info.lastName}`}` ||
        contentId
      );
    }

    if (contentType === "core:company") {
      const info = syncLog.consumeData.object || syncLog.consumeData.company;
      return info.code || info.primaryName || contentId;
    }

    return contentId;
  }
};
