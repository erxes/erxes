import { createHmac } from 'node:crypto';
import {
  agentToolsAuthHeaderName,
  decodeAgentToolsAuthHeader,
  encodeAgentToolsAuthHeader,
} from './auth';

const TEST_SECRET = 'test-agent-tools-secret';

beforeEach(() => {
  process.env.JWT_TOKEN_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.JWT_TOKEN_SECRET;
});

const headersWith = (value: string | undefined) => ({
  [agentToolsAuthHeaderName]: value,
});

describe('encode/decode agent tools auth header', () => {
  it('round-trips subdomain and userId without meta', () => {
    const header = encodeAgentToolsAuthHeader('tenant', 'user-1');

    expect(decodeAgentToolsAuthHeader(headersWith(header))).toEqual({
      subdomain: 'tenant',
      userId: 'user-1',
    });
  });

  it('round-trips the threadId only when given', () => {
    const withThread = encodeAgentToolsAuthHeader('tenant', 'user-1', {
      threadId: 'thread-9',
    });
    expect(decodeAgentToolsAuthHeader(headersWith(withThread))).toEqual({
      subdomain: 'tenant',
      userId: 'user-1',
      threadId: 'thread-9',
    });

    // Payloads minted before the threadId field existed still decode.
    const payloadBase64 = Buffer.from(
      JSON.stringify({ subdomain: 'tenant', userId: 'user-1', at: Date.now() }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', TEST_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    expect(
      decodeAgentToolsAuthHeader(headersWith(`${payloadBase64}.${signature}`)),
    ).toEqual({
      subdomain: 'tenant',
      userId: 'user-1',
    });
  });

  it('does not emit or return an empty threadId', () => {
    const header = encodeAgentToolsAuthHeader('tenant', 'user-1', {
      threadId: '',
    });

    expect(decodeAgentToolsAuthHeader(headersWith(header))).toEqual({
      subdomain: 'tenant',
      userId: 'user-1',
    });
  });

  it('rejects a tampered payload', () => {
    const header = encodeAgentToolsAuthHeader('tenant', 'user-1', {
      threadId: 'thread-9',
    });
    const [payloadBase64, signature] = header.split('.');

    const forged = Buffer.from(
      JSON.stringify({
        subdomain: 'tenant',
        userId: 'other-user',
        at: Date.now(),
      }),
      'utf8',
    ).toString('base64url');

    expect(
      decodeAgentToolsAuthHeader(headersWith(`${forged}.${signature}`)),
    ).toBeNull();
    const forgedSignature = `${signature.slice(0, -1)}${
      signature.endsWith('A') ? 'B' : 'A'
    }`;

    expect(
      decodeAgentToolsAuthHeader(
        headersWith(`${payloadBase64}.${forgedSignature}`),
      ),
    ).toBeNull();
  });

  it('rejects missing, malformed, and unsigned-foreign headers', () => {
    expect(decodeAgentToolsAuthHeader({})).toBeNull();
    expect(decodeAgentToolsAuthHeader(headersWith('no-dot'))).toBeNull();
    expect(decodeAgentToolsAuthHeader(headersWith(undefined))).toBeNull();
  });

  it('fails closed when JWT_TOKEN_SECRET is unset', () => {
    const header = encodeAgentToolsAuthHeader('tenant', 'user-1');

    delete process.env.JWT_TOKEN_SECRET;

    expect(decodeAgentToolsAuthHeader(headersWith(header))).toBeNull();
  });
});
