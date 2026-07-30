import * as crypto from 'crypto';

export const SENDGRID_SIGNATURE_HEADER =
  'x-twilio-email-event-webhook-signature';
export const SENDGRID_TIMESTAMP_HEADER =
  'x-twilio-email-event-webhook-timestamp';

/**
 * One entry of a SendGrid event webhook batch. `custom_args` come back exactly
 * as they were sent, which is how an event finds the delivery it belongs to.
 */
export interface ISendgridEvent {
  email?: string;
  event?: string;
  timestamp?: number;
  sg_message_id?: string;
  reason?: string;
  [customArg: string]: unknown;
}

/**
 * Anyone who learns the webhook URL could otherwise post invented bounces and
 * unsubscribe an organization's customers, so an unverified request is not
 * merely untrusted — it is indistinguishable from an attack.
 *
 * SendGrid signs the timestamp concatenated with the raw body, so the body has
 * to be the untouched bytes; re-serialising the parsed JSON changes them.
 */
export const verifySendgridSignature = ({
  publicKey,
  signature,
  timestamp,
  payload,
}: {
  publicKey: string;
  signature: string;
  timestamp: string;
  payload: Buffer | string;
}): boolean => {
  if (!publicKey || !signature || !timestamp) {
    return false;
  }

  try {
    const key = crypto.createPublicKey({
      key: Buffer.from(publicKey, 'base64'),
      format: 'der',
      type: 'spki',
    });

    return crypto
      .createVerify('sha256')
      .update(timestamp)
      .update(payload)
      .verify(key, signature, 'base64');
  } catch {
    // A malformed key or signature is a failed verification, not a crash.
    return false;
  }
};
