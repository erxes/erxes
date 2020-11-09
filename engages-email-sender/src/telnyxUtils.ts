import * as Telnyx from 'telnyx';
import { SMS_DELIVERY_STATUSES } from './constants';
import { sendRPCMessage } from './messageBroker';
import SmsRequests from './models/SmsRequests';

// fetches telnyx config & integrations from erxes-integrations
export const getTelnyxInfo = async () => {
  const response = await sendRPCMessage({ action: 'getTelnyxInfo' });

  const { telnyxApiKey, integrations = [] } = response;

  if (!telnyxApiKey) {
    throw new Error('Telnyx API key is not configured');
  }

  if (integrations.length < 1) {
    throw new Error('No telnyx integrations configured');
  }

  return {
    telnyxApiKey,
    instance: new Telnyx(telnyxApiKey),
    integrations
  };
};

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
          statusUpdates: statuses
        });
      }
    }
  }
};

export const prepareSmsStats = async (engageMessageId: string) => {
  const stats = await SmsRequests.aggregate([
    { $match: { engageMessageId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const result: any = { total: 0 };

  for (const s of stats) {
    result[s._id] = s.count || 0;
    result.total += s.count || 0;
  }

  return result;
};
