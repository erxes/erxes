import { IContext } from '../../connectionResolver';
import {
  sendClientPortalMessage,
  sendCoreMessage,
  sendInboxMessage
} from '../../messageBroker';
import { IActivityLogDocument } from '../../models/ActivityLogs';

export default {
  async createdByDetail(
    activityLog: IActivityLogDocument,
    _args,
    { subdomain }: IContext
  ) {
    if (!activityLog.createdBy) {
      return;
    }

    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: activityLog.createdBy
      },
      isRPC: true
    });

    if (user) {
      return { type: 'user', content: user };
    }

    const integration = await sendInboxMessage({
      subdomain,
      action: 'integrations.findOne',
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: null
    });

    if (integration) {
      const brand = await sendCoreMessage({
        subdomain,
        action: 'brands.findOne',
        data: {
          query: {
            _id: integration.brandId
          }
        },
        isRPC: true,
        defaultValue: {}
      });

      return { type: 'brand', content: brand };
    }

    const clientPortal = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortals.findOne',
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: []
    });

    if (clientPortal) {
      return { type: 'clientPortal', content: clientPortal };
    }

    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: { _id: activityLog.createdBy },
      isRPC: true,
      defaultValue: null
    });

    if (cpUser) {
      const cp = await sendClientPortalMessage({
        subdomain,
        action: 'clientPortals.findOne',
        data: { _id: cpUser.clientPortalId },
        isRPC: true,
        defaultValue: null
      });

      return {
        type: 'clientPortalUser',
        content: { ...cpUser, clientPortal: cp }
      };
    }

    return;
  }
};
