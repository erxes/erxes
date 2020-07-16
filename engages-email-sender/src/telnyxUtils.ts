import { SMS_DELIVERY_STATUSES } from './constants';
import SmsRequests from './models/SmsRequests';

export const saveTelnyxHookData = async (data: any) => {
  if (data && data.payload) {
    const { to = [], id } = data.payload;

    const initialRequest = await SmsRequests.findOne({ telnyxId: id });

    if (initialRequest) {
      const receiver = to.find(item => item.phone_number === initialRequest.to);

      // prevent updates since sms is delivered
      if (receiver && receiver.status !== SMS_DELIVERY_STATUSES.DELIVERED) {
        const statuses = initialRequest.statusUpdates || [];

        statuses.push({ date: new Date(), status: receiver.status });

        await SmsRequests.updateRequest(initialRequest._id, {
          status: receiver.status,
          responseData: JSON.stringify(data.payload),
          statusUpdates: statuses,
        });
      }
    }
  }
};

export const prepareSmsStats = async (engageMessageId: string) => {
  const stats = await SmsRequests.aggregate([
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
