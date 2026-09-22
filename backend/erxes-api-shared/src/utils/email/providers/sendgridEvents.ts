import * as crypto from 'crypto';

export const SENDGRID_SIGNATURE_HEADER =
  'x-twilio-email-event-webhook-signature';
export const SENDGRID_TIMESTAMP_HEADER =
  'x-twilio-email-event-webhook-timestamp';

export interface ISendgridEvent {
  email?: string;
  event?: string;
  timestamp?: number;
  sg_message_id?: string;
  reason?: string;
  type?: string;
  [customArg: string]: unknown;
}

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
    return false;
  }
};
