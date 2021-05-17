import * as dotenv from 'dotenv';
import * as Telnyx from 'telnyx';
import { SMS_DELIVERY_STATUSES } from './constants';
import { sendRPCMessage } from './messageBroker';
import { Logs, SmsRequests } from './models/index';
import { ICallbackParams, IMessageParams, ITelnyxMessageParams } from './types';
import { getEnv } from './utils';

dotenv.config();

interface ISmsDeliveryParams {
  type: string;
  to?: string;
  page?: number;
  perPage?: number;
}

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

export const getSmsDeliveries = async ({
  type,
  to,
  page,
  perPage
}: ISmsDeliveryParams) => {
  if (type !== 'campaign') {
    return { status: 'error', message: `Invalid parameter type: "${type}"` };
  }

  const filter: any = {};

  if (to && !(to === 'undefined' || to === 'null')) {
    filter.to = { $regex: to, $options: '$i' };
  }

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  const data = await SmsRequests.find(filter)
    .sort({ createdAt: -1 })
    .limit(_limit)
    .skip((_page - 1) * _limit);

  const totalCount = await SmsRequests.countDocuments(filter);

  return { status: 'ok', data, totalCount };
};

// alphanumeric sender id only works for countries outside north america
const isNumberNorthAmerican = (phoneNumber: string) => {
  return phoneNumber.substring(0, 2) === '+1';
};

// prepares sms object matching telnyx requirements
export const prepareMessage = async ({
  shortMessage,
  to,
  integrations
}: IMessageParams): Promise<ITelnyxMessageParams> => {
  const MAIN_API_DOMAIN = getEnv({ name: 'MAIN_API_DOMAIN' });
  const { content, from, fromIntegrationId } = shortMessage;

  const integration = integrations.find(
    i => i.erxesApiId === fromIntegrationId
  );

  if (!integration.telnyxPhoneNumber) {
    throw new Error('Telnyx phone is not configured');
  }

  const msg = {
    from: integration.telnyxPhoneNumber,
    to,
    text: content,
    messaging_profile_id: integration.telnyxProfileId || '',
    webhook_url: `${MAIN_API_DOMAIN}/telnyx/webhook`,
    webhook_failover_url: `${MAIN_API_DOMAIN}/telnyx/webhook-failover`
  };

  // to use alphanumeric sender id, messaging profile id must be set
  if (msg.messaging_profile_id && from) {
    msg.from = from;
  }

  if (isNumberNorthAmerican(msg.to)) {
    msg.from = integration.telnyxPhoneNumber;
  }

  return msg;
};

export const handleMessageCallback = async (
  err: any,
  res: any,
  data: ICallbackParams
) => {
  const { engageMessageId, msg } = data;

  const request = await SmsRequests.createRequest({
    engageMessageId,
    to: msg.to,
    requestData: JSON.stringify(msg)
  });

  if (err) {
    if (engageMessageId) {
      await Logs.createLog(
        engageMessageId,
        'failure',
        `${err.message} "${msg.to}"`
      );
    }

    await SmsRequests.updateRequest(request._id, {
      errorMessages: [err.message],
      status: 'error'
    });
  }

  if (res && res.data && res.data.to) {
    const receiver = res.data.to.find(item => item.phone_number === msg.to);

    if (engageMessageId) {
      await Logs.createLog(
        engageMessageId,
        'success',
        `Message successfully sent to "${msg.to}"`
      );
    }

    await SmsRequests.updateRequest(request._id, {
      status: receiver && receiver.status,
      responseData: JSON.stringify(res.data),
      telnyxId: res.data.id
    });
  }
};
