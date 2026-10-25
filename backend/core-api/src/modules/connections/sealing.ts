import { createSecretBox } from '~/utils/secretBox';

/**
 * Secret field values at rest: the core secret box with a key of its own
 * (HKDF salt 'erxes-connections', info 'connection-field-v1') and the
 * connection id + field key as authenticated data, so an envelope copied to
 * another connection or field does not open. No plaintext fallback.
 */
const box = createSecretBox({
  salt: 'erxes-connections',
  info: 'connection-field-v1',
  notConfiguredMessage: 'Connection encryption is not configured.',
  openFailureWarning: '[connections] Could not decrypt a stored field.',
});

const boundTo = (connectionId: string, key: string) =>
  `connection:${connectionId}:${key}`;

export const isSealedConnectionValue = (value: unknown): value is string =>
  box.isSealed(value);

export const sealConnectionValue = (
  connectionId: string,
  key: string,
  plain: string,
): string => box.seal(plain, boundTo(connectionId, key));

export const openConnectionValue = (
  connectionId: string,
  key: string,
  stored: unknown,
): string | null => box.open(stored, boundTo(connectionId, key));
