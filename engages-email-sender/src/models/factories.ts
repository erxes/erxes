import * as faker from 'faker';

import { SmsRequests } from './index';
import { ISmsRequest } from './SmsRequests';

interface ITelnyxWebhookData {
  from?: string;
  text?: string;
  to?: string;
  telnyxId?: string;
}

export const telnyxWebhookDataFactory = (params: ITelnyxWebhookData) => ({
  data: {
    event_type: faker.random.word(),
    id: faker.random.uuid(),
    occured_at: new Date().toISOString(),
    record_type: faker.random.word(),
    payload: {
      completed_at: new Date().toISOString(),
      direction: faker.random.word(),
      encoding: faker.random.word(),
      from: params.from || faker.phone.phoneNumber(),
      id: params.telnyxId || faker.random.uuid(),
      messaging_profile_id: faker.random.uuid(),
      organization_id: faker.random.uuid(),
      parts: faker.random.number(),
      received_at: new Date().toISOString(),
      record_type: faker.random.word(),
      sent_at: new Date().toISOString(),
      text: params.text || faker.random.word(),
      to: [{ phone_number: params.to || faker.phone.phoneNumber(), status: faker.random.word() }],
      type: faker.random.word(),
      valid_until: new Date().toISOString(),
      webhook_url: faker.internet.url(),
      webhook_failover_url: faker.internet.url(),
    },
  },
  meta: {
    attempt: faker.random.number(),
    delivered_to: faker.internet.url(),
  },
});

export const smsRequestFactory = async (params: ISmsRequest) => {
  const smsRequest = new SmsRequests({
    engageMessageId: params.engageMessageId || faker.random.uuid(),
    to: params.to || faker.phone.phoneNumber(),
    requestData: params.requestData || '{}',
    telnyxId: params.telnyxId || faker.random.uuid(),
  });

  return smsRequest.save();
};
