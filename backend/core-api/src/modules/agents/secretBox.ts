import { createSecretBox } from '~/utils/secretBox';

/**
 * BYOK key sealing — the core secret box (`~/utils/secretBox`) for
 * `config.apiKey` at rest, with key = HKDF-SHA256(JWT_TOKEN_SECRET,
 * salt 'erxes-agents', info 'byok-api-key-v1').
 *
 * Legacy plaintext (no `enc:v1:` prefix) passes through unchanged so readers
 * can lazily re-seal it; a rotated secret degrades to "re-enter your key".
 */
const box = createSecretBox({
  salt: 'erxes-agents',
  info: 'byok-api-key-v1',
  notConfiguredMessage: 'Agents key encryption is not configured.',
  openFailureWarning: '[agents] Could not decrypt a stored BYOK key.',
  legacyPlaintext: true,
});

/** True when the stored value is a sealed envelope, not legacy plaintext. */
export const isSealedSecret = (value: unknown): value is string =>
  box.isSealed(value);

/** Seals a plaintext key for storage; throws when encryption is not configured. */
export const sealSecret = (plain: string): string => box.seal(plain);

/** Opens a stored value; legacy plaintext passes through, failures are null. */
export const openSecret = (stored: unknown): string | null => box.open(stored);
