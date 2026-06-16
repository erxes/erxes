// turn.ts statically imports agentRuntime, which pulls ESM-only p-map via
// @mastra/core/agent and fails to parse under the nx jest preset. Stub it so the
// pure helper under test loads.
jest.mock('~/mastra/agentRuntime', () => ({ getOrCreateAgent: jest.fn() }));

import { toUserFacingError } from '@/agent/turn';

describe('toUserFacingError', () => {
  const cases: [string, RegExp][] = [
    ['Error: 429 too many requests', /rate-limited/],
    ['rate limit exceeded', /rate-limited/],
    ['401 Unauthorized', /permission or credential/],
    ['Forbidden: access denied', /permission or credential/],
    ['invalid api key provided', /permission or credential/],
    ['request timed out', /took too long|unreachable/],
    ['connect ETIMEDOUT 10.0.0.1:443', /took too long|unreachable/],
    ['fetch failed', /took too long|unreachable/],
    ['502 Bad Gateway', /temporarily unavailable/],
    ['Service Unavailable', /temporarily unavailable/],
    ['validation failed: name is required', /missing or invalid/],
  ];

  it.each(cases)('maps %j to a plain message', (raw, expected) => {
    expect(toUserFacingError(new Error(raw)).message).toMatch(expected);
  });

  it('falls through to a generic message for unknown errors (no raw leak)', () => {
    const msg = toUserFacingError(new Error('weird boom')).message;
    expect(msg).toMatch(/Something went wrong/);
    expect(msg).not.toMatch(/weird boom/);
  });

  it('redacts long tokens from the server log on unmatched errors', () => {
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {
        /* swallow expected error log */
      });
    try {
      toUserFacingError(
        new Error('boom key=sk-abcdefABCDEF0123456789zzzzzzzzzzzz happened'),
      );
      const logged = spy.mock.calls.flat().join(' ');
      expect(logged).not.toMatch(/sk-abcdefABCDEF0123456789zzzzzzzzzzzz/);
      expect(logged).toMatch(/redacted/);
    } finally {
      spy.mockRestore();
    }
  });

  it('never leaks HTTP codes or stack frames for matched rules', () => {
    const msg = toUserFacingError(
      new Error('403 Forbidden at Object.<anonymous> (/app/x.js:1:1)'),
    ).message;
    expect(msg).not.toMatch(/403|\.js:/);
  });
});
