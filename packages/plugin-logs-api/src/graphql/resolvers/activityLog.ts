import { IActivityLogDocument } from '../../models/ActivityLogs';
import { sendCoreMessage, sendInboxMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async createdByDetail(
    activityLog: IActivityLogDocument,
    _args,
    { subdomain }: IContext
  ) {
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
      defaultValue: []
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

    return;
  }
};
