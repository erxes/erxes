import { ISmsRequest } from '@/broadcast/@types';
import { faker } from '@faker-js/faker';
import { IModels } from '~/connectionResolvers';

interface ITelnyxWebhookData {
  from?: string;
  text?: string;
  to?: string;
  telnyxId?: string;
}

export const telnyxWebhookDataFactory = (params: ITelnyxWebhookData) => ({
  data: {
    event_type: faker.word.sample(),
    id: faker.string.uuid(),
    occurred_at: new Date().toISOString(),
    record_type: faker.word.sample(),
    payload: {
      completed_at: new Date().toISOString(),
      direction: faker.word.sample(),
      encoding: faker.word.sample(),
      from: params.from || faker.phone.number(),
      id: params.telnyxId || faker.string.uuid(),
      messaging_profile_id: faker.string.uuid(),
      organization_id: faker.string.uuid(),
      parts: faker.number.int({ min: 1, max: 10 }),
      received_at: new Date().toISOString(),
      record_type: faker.word.sample(),
      sent_at: new Date().toISOString(),
      text: params.text || faker.word.sample(),
      to: [
        {
          phone_number: params.to || faker.phone.number(),
          status: faker.word.sample(),
        },
      ],
      type: faker.word.sample(),
      valid_until: new Date().toISOString(),
      webhook_url: faker.internet.url(),
      webhook_failover_url: faker.internet.url(),
    },
  },
  meta: {
    attempt: faker.number.int({ min: 1, max: 5 }),
    delivered_to: faker.internet.url(),
  },
});

export const smsRequestFactory = async (
  models: IModels,
  params: ISmsRequest,
) => {
  const smsRequest = new models.SmsRequests({
    engageMessageId: params.engageMessageId || faker.string.uuid(),
    to: params.to || faker.phone.number(),
    requestData: params.requestData || '{}',
    telnyxId: params.telnyxId || faker.string.uuid(),
  });

  return smsRequest.save();
};
