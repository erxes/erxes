/**
 * Provider resolution contract tests.
 *
 * The security-relevant guarantees here:
 *
 * - credentials come only from the agent connection document, never env vars;
 * - a connection without usable credentials fails loudly with an actionable
 *   message pointing at Automation → Agents, instead of building a broken model;
 * - unsupported providers are rejected rather than silently defaulted;
 * - kimi-code (Anthropic protocol) base URLs are normalized to the versioned
 *   layout exactly once, and connection-level headers keep priority.
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

  it('requires an API key for direct providers and points at the fix', () => {
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

  it('requires accountId and gatewayId for the Cloudflare gateway', () => {
    expect(() =>
      resolveModelConnection({
        connection: connection('cloudflare-ai-gateway', { apiKey: 'k' }),
      }),
    ).toThrow('needs accountId and gatewayId');
  });

  it('falls back to public defaults for model and endpoint, never for credentials', () => {
    const resolved = resolveModelConnection({
      connection: connection('openai', { apiKey: 'sk-test' }),
    });

    expect(resolved).toEqual({
      provider: 'openai',
      model: 'gpt-5.6-luna',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      headers: {},
    });
  });

  it('prefers the per-agent connection values over provider defaults', () => {
    const resolved = resolveModelConnection({
      connection: connection(
        'grok',
        {
          apiKey: 'xk',
          baseUrl: 'https://proxy.example.com/v1',
          headers: { 'x-trace': 'abc' },
        },
        'grok-custom',
      ),
    });

    expect(resolved.model).toBe('grok-custom');
    expect(resolved.baseUrl).toBe('https://proxy.example.com/v1');
    expect(resolved.headers).toEqual({ 'x-trace': 'abc' });
  });

  it('builds the Cloudflare gateway URL in compat mode by default', () => {
    const resolved = resolveModelConnection({
      connection: connection('cloudflare-ai-gateway', {
        accountId: 'acc-1',
        gatewayId: 'gw-1',
      }),
    });

    expect(resolved.baseUrl).toBe(
      'https://gateway.ai.cloudflare.com/v1/acc-1/gw-1/compat',
    );
  });

  it('builds the Cloudflare gateway URL in openai-provider mode when requested', () => {
    const resolved = resolveModelConnection({
      connection: connection('cloudflare-ai-gateway', {
        accountId: 'acc-1',
        gatewayId: 'gw-1',
        mode: 'openai-provider',
      }),
    });

    expect(resolved.baseUrl).toBe(
      'https://gateway.ai.cloudflare.com/v1/acc-1/gw-1/openai',
    );
  });

  it('honors a custom Cloudflare gateway root and trims surrounding slashes', () => {
    const resolved = resolveModelConnection({
      connection: connection('cloudflare-ai-gateway', {
        accountId: '/acc-1/',
        gatewayId: 'gw-1',
        baseUrl: 'https://gateway.example.com/',
      }),
    });

    expect(resolved.baseUrl).toBe(
      'https://gateway.example.com/acc-1/gw-1/compat',
    );
  });
});

describe('createModelConfig', () => {
  it('returns Mastra’s native config object for OpenAI-compatible providers', async () => {
    const resolved = resolveModelConnection({
      connection: connection('grok', { apiKey: 'xk' }, 'grok-4.5'),
    });

    const model = await createModelConfig(resolved);

    expect(model).toEqual({
      id: 'grok/grok-4.5',
      url: 'https://api.x.ai/v1',
      apiKey: 'xk',
      headers: {},
    });
    expect(mockedCreateAnthropic).not.toHaveBeenCalled();
  });

  it('routes OpenAI on the default endpoint through Mastra’s native gateway (no url)', async () => {
    // A url would force the generic openai-compatible Chat Completions
    // client, which maps maxOutputTokens to `max_tokens` — rejected by
    // OpenAI's reasoning models. Without url, Mastra resolves `openai/*`
    // through its native OpenAI Responses client.
    const resolved = resolveModelConnection({
      connection: connection('openai', { apiKey: 'sk-test' }, 'gpt-5.6-luna'),
    });

    const model = await createModelConfig(resolved);

    expect(model).toEqual({
      id: 'openai/gpt-5.6-luna',
      apiKey: 'sk-test',
      headers: {},
    });
    expect(mockedCreateAnthropic).not.toHaveBeenCalled();
  });

  it('keeps the openai-compatible path for an explicit OpenAI proxy endpoint', async () => {
    const resolved = resolveModelConnection({
      connection: connection(
        'openai',
        { apiKey: 'sk-test', baseUrl: 'https://proxy.example.com/v1' },
        'gpt-5.6-luna',
      ),
    });

    const model = await createModelConfig(resolved);

    expect(model).toEqual({
      id: 'openai/gpt-5.6-luna',
      url: 'https://proxy.example.com/v1',
      apiKey: 'sk-test',
      headers: {},
    });
  });

  it('normalizes the kimi-code base URL to the versioned layout exactly once', async () => {
    const resolved = resolveModelConnection({
      connection: connection('kimi-code', { apiKey: 'kk' }),
    });

    await createModelConfig(resolved);

    expect(mockedCreateAnthropic).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://api.kimi.com/coding/v1',
      }),
    );
  });

  it('does not double-append /v1 when the custom host is already versioned', async () => {
    const resolved = resolveModelConnection({
      connection: connection(
        'kimi-code',
        { apiKey: 'kk', baseUrl: 'https://proxy.example.com/coding/v1/' },
      ),
    });

    await createModelConfig(resolved);

    expect(mockedCreateAnthropic).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'https://proxy.example.com/coding/v1',
      }),
    );
  });

  it('authenticates kimi-code with both header styles, letting connection headers win', async () => {
    const resolved = resolveModelConnection({
      connection: connection('kimi-code', {
        apiKey: 'kk',
        headers: { Authorization: 'Bearer override', 'x-extra': 'v' },
      }),
    });

    await createModelConfig(resolved);

    expect(mockedCreateAnthropic).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'kk',
        headers: { Authorization: 'Bearer override', 'x-extra': 'v' },
      }),
    );
  });

  it('never passes authToken alongside apiKey for kimi-code', async () => {
    const resolved = resolveModelConnection({
      connection: connection('kimi-code', { apiKey: 'kk' }),
    });

    await createModelConfig(resolved);

    const config = mockedCreateAnthropicCalls()[0][0] as Record<
      string,
      unknown
    >;
    expect(config).not.toHaveProperty('authToken');
  });

  it('builds the kimi-code language model for the resolved model id', async () => {
    const resolved = resolveModelConnection({
      connection: connection('kimi-code', { apiKey: 'kk' }, 'kimi-custom'),
    });

    const model = await createModelConfig(resolved);

    expect(modelFactory).toHaveBeenCalledWith('kimi-custom');
    expect(model).toEqual({ modelId: 'kimi-custom' });
  });
});
