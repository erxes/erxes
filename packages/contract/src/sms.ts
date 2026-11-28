import { oc } from '@orpc/contract';
import { z } from 'zod';
import { PhoneNumber } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

/** A text erxes sends for a plugin through the organisation's SMS connection. */
export const SmsMessage = z.object({
  to: z.array(PhoneNumber).min(1).max(50),
  text: z.string().trim().min(1).max(1000),
});

export type SmsMessage = z.infer<typeof SmsMessage>;

export const smsContract = {
  send: oc
    .errors({ ...COMMON_ERRORS, SMS_NOT_CONFIGURED: ERRORS.SMS_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/sms',
      successStatus: 202,
      summary: 'Send a text',
      description:
        "Text up to 50 phones through the organisation's SMS connection (CallPro, Twilio; plugins with sms:write). Queued and retried; a phone that fails doesn't stop the others. 409 SMS_NOT_CONFIGURED when texts can't go out",
    })
    .input(SmsMessage)
    .output(z.object({ queued: z.int() })),
};
