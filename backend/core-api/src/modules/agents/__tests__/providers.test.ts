/**
 * Provider resolution contract tests.
 *
 * The security-relevant guarantees here:
 *
 * - credentials come only from the agent connection document, never env vars;
 * - a connection without usable credentials fails loudly with an actionable
 *   message pointing at Automation → Agents, instead of building a broken model;
 * - unsupported providers are rejected rather than silently defaulted;
 * - openai, grok and kimi go through Mastra's model router under its own
 *   provider ids, so provider options reach each provider's native client.
 */

import {
  createModelConfig,
  resolveModelConnection,
} from '@/agents/providers';
import type {
  IAiAgentConnection,
  IAiAgentConnectionConfig,
} from 'erxes-api-shared/core-modules';

jest.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: jest.fn(),
}));

// `@ai-sdk/anthropic` is ESM-only; the mocked module is retrieved through
// jest.requireMock so this CommonJS file never imports it.
const { createAnthropic: mockedCreateAnthropic } = jest.requireMock(
  '@ai-sdk/anthropic',
) as { createAnthropic: jest.Mock };

const mockedCreateAnthropicCalls = () =>
  mockedCreateAnthropic.mock.calls as unknown[][];

const connection = (
  provider: string,
  config: IAiAgentConnectionConfig = {},
  model?: string,
): IAiAgentConnection =>
  ({
    provider,
    model,
    config,
  }) as unknown as IAiAgentConnection;

const modelFactory = jest.fn((model: string) => ({ modelId: model }));

beforeEach(() => {
  jest.clearAllMocks();
  mockedCreateAnthropic.mockReturnValue(modelFactory);
});

describe('resolveModelConnection', () => {
  it('rejects unsupported providers instead of silently defaulting', () => {
    expect(() =>
      resolveModelConnection({
        connection: connection('not-a-provider', { apiKey: 'k' }),
      }),
    ).toThrow('Unsupported AI provider "not-a-provider"');
  });

  it('requires an API key and points at the fix', () => {
    expect(() =>
      resolveModelConnection({ connection: connection('openai', {}) }),
    ).toThrow(
      'AI provider "openai" has no API key. Add it to the agent\'s connection under Automation -> Agents.',
    );
  });

  it('treats a whitespace-only API key as missing', () => {
    expect(() =>
      resolveModelConnection({
        connection: connection('openai', { apiKey: '   ' }),
      }),
    ).toThrow('has no API key');
  });

  it('falls back to the provider default model, never to default credentials', () => {
    expect(
      resolveModelConnection({
        connection: connection('openai', { apiKey: 'sk-test' }),
      }),
    ).toEqual({ provider: 'openai', model: 'gpt-5.6-luna', apiKey: 'sk-test' });
  });

  it('keeps the stored model over the default', () => {
    const resolved = resolveModelConnection({
      connection: connection('grok', { apiKey: 'xk' }, 'grok-custom'),
    });

    expect(resolved.model).toBe('grok-custom');
  });
});

describe('createModelConfig', () => {
  it.each([
    ['openai', 'gpt-5.6-luna', 'openai/gpt-5.6-luna'],
    ['grok', 'grok-4.5', 'xai/grok-4.5'],
    ['kimi', 'kimi-k3', 'moonshotai/kimi-k3'],
  ])('routes %s through the Mastra model router as %s', async (provider, model, id) => {
    const config = await createModelConfig(
      resolveModelConnection({
        connection: connection(provider, { apiKey: 'k' }, model),
      }),
    );

    // No url: a url would force the generic openai-compatible client, which
    // ignores provider options such as xai.reasoningEffort.
    expect(config).toEqual({ id, apiKey: 'k' });
    expect(mockedCreateAnthropic).not.toHaveBeenCalled();
  });

  it('builds kimi-code on the Anthropic protocol with both auth header styles', async () => {
    const model = await createModelConfig(
      resolveModelConnection({
        connection: connection('kimi-code', { apiKey: 'kk' }, 'kimi-custom'),
      }),
    );

    expect(mockedCreateAnthropic).toHaveBeenCalledWith({
      apiKey: 'kk',
      baseURL: 'https://api.kimi.com/coding/v1',
      headers: { Authorization: 'Bearer kk' },
    });
    expect(mockedCreateAnthropicCalls()[0][0]).not.toHaveProperty('authToken');
    expect(modelFactory).toHaveBeenCalledWith('kimi-custom');
    expect(model).toEqual({ modelId: 'kimi-custom' });
  });
});
