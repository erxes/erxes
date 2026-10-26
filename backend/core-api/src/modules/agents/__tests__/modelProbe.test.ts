/**
 * Manual model verification: a typed model id is checked with one minimal
 * request through the chat's provider client. Invalid, non-chat and
 * unreadable-key cases never reach the network, and every error is key-free.
 */

const doStream = jest.fn();
const resolveModelConfig = jest.fn<
  Promise<{ doStream: jest.Mock }>,
  unknown[]
>(async () => ({ doStream }));

jest.mock('@mastra/core/llm', () => ({
  resolveModelConfig: (...args: unknown[]) => resolveModelConfig(...args),
}));
jest.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: jest.fn(() => (model: string) => ({
    anthropicModel: model,
  })),
}));

import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { probeProviderModel } from '@/agents/modelProbe';

const KEY = 'sk-proj-probe-test-secret-value';
const connection = (
  provider: string,
  apiKey: string | null = KEY,
): IAiAgentConnection =>
  ({
    provider,
    model: 'saved-model',
    config: apiKey === null ? {} : { apiKey },
  } as IAiAgentConnection);

const streamOf = (...chunks: Array<{ type: string; error?: unknown }>) => ({
  stream: new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  }),
});

const apiCallError = (statusCode: number, message: string) =>
  Object.assign(new Error('Provider request failed'), {
    name: 'AI_APICallError',
    statusCode,
    responseBody: JSON.stringify({ error: { message } }),
  });

beforeEach(() => {
  doStream.mockReset();
  resolveModelConfig.mockClear();
});

it('accepts a model the provider answers for, with a minimal request', async () => {
  doStream.mockResolvedValue(
    streamOf({ type: 'stream-start' }, { type: 'text-delta' }),
  );

  await expect(
    probeProviderModel({
      connection: connection('openai'),
      model: 'gpt-6-luna',
    }),
  ).resolves.toEqual({ ok: true, error: null });

  expect(resolveModelConfig).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'openai/gpt-6-luna', apiKey: KEY }),
  );
  const [options] = doStream.mock.calls[0];
  expect(options.maxOutputTokens).toBe(16);
  expect(options.providerOptions).toBeUndefined();
});

it('probes kimi-code with minimal thinking because some models require it', async () => {
  doStream.mockResolvedValue(streamOf({ type: 'response-metadata' }));

  await expect(
    probeProviderModel({
      connection: connection('kimi-code'),
      model: 'k3.1-pro',
    }),
  ).resolves.toEqual({ ok: true, error: null });

  expect(resolveModelConfig).toHaveBeenCalledWith({
    anthropicModel: 'k3.1-pro',
  });
  const [options] = doStream.mock.calls[0];
  expect(options.providerOptions).toEqual({
    anthropic: { thinking: { type: 'enabled', budgetTokens: 1024 } },
  });
  expect(options.maxOutputTokens).toBeGreaterThan(1024);
});

it('reports the provider’s reason when it rejects the model', async () => {
  doStream.mockRejectedValue(
    apiCallError(
      404,
      'The model `gpt-7` does not exist or you do not have access to it.',
    ),
  );

  await expect(
    probeProviderModel({ connection: connection('openai'), model: 'gpt-7' }),
  ).resolves.toEqual({
    ok: false,
    error:
      'OpenAI rejected "gpt-7" (404): The model `gpt-7` does not exist or you do not have access to it.',
  });
});

it('does not accept a stream that ends without any model response', async () => {
  doStream.mockResolvedValue(streamOf({ type: 'stream-start' }));

  await expect(
    probeProviderModel({
      connection: connection('openai'),
      model: 'gpt-6-luna',
    }),
  ).resolves.toEqual({
    ok: false,
    error: 'OpenAI sent no response while checking "gpt-6-luna". Try again.',
  });
});

it('reports a rejection delivered as an error chunk', async () => {
  doStream.mockResolvedValue(
    streamOf(
      { type: 'stream-start' },
      {
        type: 'error',
        error: apiCallError(400, 'Model not allowed for this project'),
      },
    ),
  );

  const result = await probeProviderModel({
    connection: connection('openai'),
    model: 'gpt-5.6-luna',
  });

  expect(result.ok).toBe(false);
  expect(result.error).toContain('Model not allowed for this project');
});

it('never echoes the key, even when the provider does', async () => {
  doStream.mockRejectedValue(
    apiCallError(401, `Incorrect API key provided: ${KEY}.`),
  );

  const result = await probeProviderModel({
    connection: connection('openai'),
    model: 'gpt-6-luna',
  });

  expect(result.error).toBe(
    'OpenAI rejected the saved API key (401). Re-enter it in Settings → API key.',
  );
  expect(JSON.stringify(result)).not.toContain(KEY);

  doStream.mockRejectedValue(
    apiCallError(403, `Key sk-proj-****alue is not permitted for ${KEY}`),
  );
  const masked = await probeProviderModel({
    connection: connection('openai'),
    model: 'gpt-6-luna',
  });
  expect(masked.error).not.toContain('sk-proj');
  expect(masked.error).not.toContain(KEY);
});

it('explains a timeout instead of calling it a rejection', async () => {
  doStream.mockRejectedValue(
    Object.assign(new Error('aborted'), { name: 'TimeoutError' }),
  );

  const result = await probeProviderModel({
    connection: connection('grok'),
    model: 'grok-5',
  });

  expect(result.error).toBe(
    'Grok did not answer within 20s while checking "grok-5". Try again.',
  );
});

it.each([
  ['gpt 6', 'Enter a model id'],
  ['', 'Enter a model id'],
  ['text-embedding-3-large', 'is not a chat model'],
])('refuses %p before any request', async (model, message) => {
  const result = await probeProviderModel({
    connection: connection('openai'),
    model,
  });

  expect(result.ok).toBe(false);
  expect(result.error).toContain(message);
  expect(resolveModelConfig).not.toHaveBeenCalled();
});

it('explains an unusable stored key before any request', async () => {
  const result = await probeProviderModel({
    connection: connection('openai', null),
    model: 'gpt-6-luna',
  });

  expect(result).toEqual({
    ok: false,
    error: 'No OpenAI API key is saved. Add it in Settings → API key.',
  });
  expect(resolveModelConfig).not.toHaveBeenCalled();
});
