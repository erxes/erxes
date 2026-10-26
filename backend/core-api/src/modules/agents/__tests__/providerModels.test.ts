/**
 * Provider listing errors shown to users: provider messages are stripped of
 * keys and credential-shaped tokens, and unreadable stored keys name the
 * server-side reason without revealing anything about the key.
 */

import { sanitizeProviderMessage } from '@/agents/providerModels';

describe('sanitizeProviderMessage', () => {
  it('removes the key, masked key fragments and long tokens but keeps model ids', () => {
    const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz0123456789';

    expect(
      sanitizeProviderMessage(
        `Incorrect API key provided: ${key}. Masked sk-proj-****6789 and xai-AbC123 too.`,
        key,
      ),
    ).toBe('Incorrect API key provided: <key>. Masked <key> and <key> too.');
    expect(
      sanitizeProviderMessage(
        'Token ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 rejected for gpt-4o-mini-realtime-preview-2024-12-17',
        'unrelated',
      ),
    ).toBe(
      'Token <redacted> rejected for gpt-4o-mini-realtime-preview-2024-12-17',
    );
  });

  it('truncates long messages and ignores non-strings', () => {
    expect(sanitizeProviderMessage('x '.repeat(300), 'k').length).toBe(200);
    expect(sanitizeProviderMessage({ nested: true }, 'k')).toBe('');
  });
});

describe('describeUnreadableKey', () => {
  const original = process.env.JWT_TOKEN_SECRET;

  afterEach(() => {
    process.env.JWT_TOKEN_SECRET = original;
    jest.resetModules();
  });

  it('distinguishes a missing encryption secret from a changed one', () => {
    delete process.env.JWT_TOKEN_SECRET;
    jest.isolateModules(() => {
      const { describeUnreadableKey } = jest.requireActual<
        typeof import('@/agents/providerModels')
      >('@/agents/providerModels');

      expect(describeUnreadableKey('kimi-code', 'enc:v1:a:b:c')).toContain(
        "key encryption isn't configured on this server (JWT_TOKEN_SECRET)",
      );
    });

    process.env.JWT_TOKEN_SECRET = 'another-secret';
    jest.isolateModules(() => {
      const { describeUnreadableKey } = jest.requireActual<
        typeof import('@/agents/providerModels')
      >('@/agents/providerModels');

      expect(describeUnreadableKey('kimi-code', 'enc:v1:a:b:c')).toBe(
        "The saved Kimi Code key can't be decrypted on this server (its encryption secret changed). Re-enter it in Settings → API key.",
      );
      expect(describeUnreadableKey('openai', undefined)).toBe(
        'No OpenAI API key is saved. Add it in Settings → API key.',
      );
    });
  });
});
