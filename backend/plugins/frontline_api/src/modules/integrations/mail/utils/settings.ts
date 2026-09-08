import { MAIL_SENDER_NAME_MAX_LENGTH } from '@/integrations/mail/constants';
import { isEmailAddress } from '@/integrations/mail/utils/address';

export const normalizeSenderName = (value: unknown) => {
  const senderName = typeof value === 'string' ? value.trim() : '';

  if (!senderName) {
    return '';
  }

  if (/[\r\n]/.test(senderName)) {
    throw new Error('A sender name cannot contain line breaks');
  }

  if (senderName.length > MAIL_SENDER_NAME_MAX_LENGTH) {
    throw new Error(
      `A sender name can be at most ${MAIL_SENDER_NAME_MAX_LENGTH} characters`,
    );
  }

  return senderName;
};

export const normalizeForwardFrom = (value: unknown, address: string) => {
  const forwardFrom =
    typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (!forwardFrom) {
    return '';
  }

  if (!isEmailAddress(forwardFrom)) {
    throw new Error(`${forwardFrom} is not a valid email address`);
  }

  if (forwardFrom === address) {
    throw new Error(
      'The forwarding address cannot be the inbox address itself — that would loop mail back into this inbox',
    );
  }

  return forwardFrom;
};
