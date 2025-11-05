import { IModels } from '~/connectionResolvers';
import { sendClientPortalMessage } from './messageBroker';

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
  const clientPortalNotifications = await sendClientPortalMessage({
    subdomain,
    action: 'clientPortalEngageNotifications',
    data: {
      selector: { isRead: true, groupId: engageMessageId },
    },
    isRPC: true,
    defaultValue: 0,
  });

  const result: any = { read: clientPortalNotifications || 0 };

  return result;
};
