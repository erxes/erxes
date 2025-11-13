import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const prepareSmsStats = async (
  models: IModels,
  engageMessageId: string,
) => {
  const stats = await models.SmsRequests.aggregate([
    { $match: { engageMessageId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const result: any = { total: 0 };

  for (const s of stats) {
    result[s._id] = s.count || 0;
    result.total += s.count || 0;
  }

  return result;
};

export const prepareNotificationStats = async (
  subdomain: string,
  engageMessageId: string,
) => {
  const clientPortalNotifications = await sendTRPCMessage({
    subdomain,
    pluginName: 'clientPortal',
    method: 'query',
    module: 'clientPortalNotifications',
    action: 'clientPortalEngageNotifications',
    input: {
      selector: { isRead: true, groupId: engageMessageId },
    },
    defaultValue: 0,
  });

  const result: any = { read: clientPortalNotifications || 0 };

  return result;
};
