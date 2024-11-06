import { IContext } from "../../connectionResolver";
import { IActivityLogDocument } from "../../db/models/definitions/activityLogs";
import { sendClientPortalMessage, sendInboxMessage } from "../../messageBroker";

export default {
  async createdByDetail(
    activityLog: IActivityLogDocument,
    _args,
    { subdomain, models }: IContext
  ) {
    if (!activityLog.createdBy) {
      return;
    }

    const user = await models.Users.findOne({ _id: activityLog.createdBy });

    if (user) {
      return { type: "user", content: user };
    }

    const integration = await sendInboxMessage({
      subdomain,
      action: "integrations.findOne",
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: null
    });

    if (integration) {
      const brand = await models.Brands.findOne({ _id: integration.brandId });

      return { type: "brand", content: brand };
    }

    const clientPortal = await sendClientPortalMessage({
      subdomain,
      action: "clientPortals.findOne",
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: []
    });

    if (clientPortal) {
      return { type: "clientPortal", content: clientPortal };
    }

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: null
    });

    if (cpUser) {
      const cp = await sendClientPortalMessage({
        subdomain,
        action: "clientPortals.findOne",
        data: { _id: cpUser.clientPortalId },
        isRPC: true,
        defaultValue: null
      });

      return {
        type: "clientPortalUser",
        content: { ...cpUser, clientPortal: cp }
      };
    }

    return;
  }
};
