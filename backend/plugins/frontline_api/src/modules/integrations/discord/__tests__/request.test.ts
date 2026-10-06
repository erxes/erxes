import {
  discordRequest,
  fetchWithNetworkRetry,
} from '@/integrations/discord/utils/request';
import {
  MAX_NETWORK_RETRIES,
  MAX_RATE_LIMIT_RETRIES,
} from '@/integrations/discord/constants/request';
import { splitDiscordContent } from '@/integrations/discord/utils/messages/content';

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('bounds retries for a failing idempotent request', async () => {
  const failure = new Error('connection reset');
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(failure);
  const result = expect(
    fetchWithNetworkRetry('https://example.invalid'),
  ).rejects.toBe(failure);
  await jest.runAllTimersAsync();
  await result;
  expect(fetchMock).toHaveBeenCalledTimes(MAX_NETWORK_RETRIES + 1);
});

it('does not retry a message POST after an ambiguous network failure', async () => {
  const failure = new Error('connection reset');
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockRejectedValue(failure);
  await expect(
    fetchWithNetworkRetry('https://example.invalid', { method: 'POST' }),
  ).rejects.toBe(failure);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('bounds Discord rate-limit retries and surfaces the final API error', async () => {
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ retry_after: 0.1, message: 'Rate limited' }),
          { status: 429 },
        ),
    );
  const result = expect(
    discordRequest({
      token: 'test-token',
      method: 'POST',
      path: '/channels/test/messages',
    }),
  ).rejects.toThrow('Rate limited');
  await jest.runAllTimersAsync();
  await result;
  expect(fetchMock).toHaveBeenCalledTimes(MAX_RATE_LIMIT_RETRIES + 1);
});

it('keeps an emoji intact at a UTF-16 chunk boundary', () => {
  const content = `${'a'.repeat(9)}😀rest`;
  const { chunks } = splitDiscordContent(content, 10);
  expect(chunks.join('')).toBe(content);
  expect(chunks).toEqual(['a'.repeat(9), '😀rest']);
});
