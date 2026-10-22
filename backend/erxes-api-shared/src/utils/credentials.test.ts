import { getCredentialValue, getCredentialValues } from './credentials';

const reference = 'cred_11111111-1111-4111-8111-111111111111';
const otherReference = 'cred_22222222-2222-4222-8222-222222222222';
const token = 'synthetic-consumer-token';
const endpoint = 'https://core-api.example.invalid';
const payload = {
  reference,
  templateId: 'generic',
  values: { testKey: 'synthetic-value' },
};
const jsonResponse = (body: unknown = payload, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('server credential helpers', () => {
  const originalEnvironment = process.env;
  let request: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    process.env = {
      ...originalEnvironment,
      NODE_ENV: 'test',
      PLATFORM_CREDENTIALS_URL: endpoint,
      PLATFORM_CREDENTIALS_TOKEN: token,
      PLATFORM_CREDENTIALS_REFERENCE: reference,
    };
    request = jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse());
  });

  afterEach(() => {
    process.env = originalEnvironment;
    jest.restoreAllMocks();
  });

  it('reads one key with env defaults and the grant-scoped HTTP contract', async () => {
    await expect(getCredentialValue('testKey')).resolves.toBe(
      'synthetic-value',
    );
    expect(request).toHaveBeenCalledWith(
      new URL('/credentials/consume', endpoint),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
        cache: 'no-store',
        redirect: 'error',
        signal: expect.any(AbortSignal),
      },
    );
    expect(request.mock.calls[0][1]?.signal?.aborted).toBe(false);
  });

  it('supports several named instances with independent tokens and references', async () => {
    request.mockResolvedValueOnce(
      jsonResponse({
        ...payload,
        reference: otherReference,
        templateId: 'smtp',
      }),
    );
    await expect(
      getCredentialValues({
        token: 'synthetic-email-token',
        reference: otherReference,
        templateId: 'smtp',
      }),
    ).resolves.toEqual(payload.values);
    expect(request.mock.calls[0][1]).toMatchObject({
      headers: { Authorization: 'Bearer synthetic-email-token' },
      body: JSON.stringify({ reference: otherReference }),
    });
  });

  it('does not cache decrypted values, and observes revocation on the next call', async () => {
    request
      .mockResolvedValueOnce(jsonResponse())
      .mockResolvedValueOnce(jsonResponse({}, 403));
    await expect(getCredentialValue('testKey')).resolves.toBe(
      'synthetic-value',
    );
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential unavailable',
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each([
    'PLATFORM_CREDENTIALS_URL',
    'PLATFORM_CREDENTIALS_TOKEN',
    'PLATFORM_CREDENTIALS_REFERENCE',
  ])('fails closed without %s', async (name) => {
    delete process.env[name];
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential consumer is not configured',
    );
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    'http://core-api.example.invalid',
    'https://user:password@core-api.example.invalid',
    'https://core-api.example.invalid?token=synthetic',
    'https://core-api.example.invalid#synthetic',
    'https://core-api.example.invalid/other-service',
    'file:///credentials',
    'invalid',
  ])(
    'does not send a token to an unsafe or malformed endpoint: %s',
    async (url) => {
      await expect(
        getCredentialValue('testKey', { endpoint: url }),
      ).rejects.toThrow('Credential unavailable');
      expect(request).not.toHaveBeenCalled();
    },
  );

  it.each([
    'http://localhost:3300',
    'http://127.0.0.1:3300',
    'http://[::1]:3300',
  ])('allows loopback HTTP for local development: %s', async (url) => {
    await expect(
      getCredentialValue('testKey', { endpoint: url }),
    ).resolves.toBe('synthetic-value');
  });

  it('requires HTTPS in production, including for loopback', async () => {
    process.env.NODE_ENV = 'production';
    await expect(
      getCredentialValue('testKey', { endpoint: 'http://localhost:3300' }),
    ).rejects.toThrow('Credential unavailable');
    expect(request).not.toHaveBeenCalled();
  });

  it.each(['', 'constructor', '__proto__', 'prototype', 'bad.key'])(
    'rejects invalid field key %s without sending a request',
    async (key) => {
      await expect(getCredentialValue(key)).rejects.toThrow(
        'Credential unavailable',
      );
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('rejects malformed configuration without falling back to a different grant', async () => {
    await expect(getCredentialValue('testKey', { token: '' })).rejects.toThrow(
      'Credential consumer is not configured',
    );
    await expect(
      getCredentialValue('testKey', { reference: 'not-a-reference' }),
    ).rejects.toThrow('Credential unavailable');
    await expect(
      getCredentialValue('testKey', { token: 'bad\r\ntoken' }),
    ).rejects.toThrow('Credential unavailable');
    expect(request).not.toHaveBeenCalled();
  });

  it.each<{ body: unknown }>([
    { body: { ...payload, reference: otherReference } },
    { body: { ...payload, values: { testKey: 42 } } },
    { body: { ...payload, values: { testKey: null } } },
    { body: { ...payload, values: ['synthetic'] } },
    { body: { ...payload, values: { testKey: 'x'.repeat(16385) } } },
    { body: { ...payload, values: { constructor: 'synthetic' } } },
    { body: { ...payload, values: {} } },
    { body: null },
  ])(
    'rejects missing keys or invalid/mismatched payloads without including them in errors',
    async ({ body }) => {
      request.mockResolvedValueOnce(jsonResponse(body));
      await expect(getCredentialValue('testKey')).rejects.toThrow(
        /^Credential unavailable$/,
      );
    },
  );

  it('rejects an unexpected template when requested', async () => {
    await expect(
      getCredentialValue('testKey', { templateId: 'smtp' }),
    ).rejects.toThrow('Credential unavailable');
  });

  it('preserves explicitly stored empty strings rather than inventing a fallback', async () => {
    request.mockResolvedValueOnce(
      jsonResponse({ ...payload, values: { testKey: '' } }),
    );
    await expect(getCredentialValue('testKey')).resolves.toBe('');
  });

  it.each([400, 403, 404, 429, 500])(
    'fails closed on HTTP %s',
    async (status) => {
      request.mockResolvedValueOnce(
        jsonResponse({ error: 'synthetic-sensitive-body' }, status),
      );
      await expect(getCredentialValue('testKey')).rejects.toThrow(
        /^Credential unavailable$/,
      );
    },
  );

  it('normalizes network/timeout failures without original details or causes', async () => {
    request.mockRejectedValueOnce(new Error('synthetic-token-and-value'));
    const error: unknown = await getCredentialValue('testKey').catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({ message: 'Credential unavailable' });
    expect(error).not.toHaveProperty('cause');
    expect(String(error)).not.toContain('synthetic');
  });

  it('rejects invalid JSON and non-JSON responses', async () => {
    request.mockResolvedValueOnce(
      new Response('synthetic-not-json', {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential unavailable',
    );
    request.mockResolvedValueOnce(
      new Response('synthetic-sensitive-html', {
        headers: { 'Content-Type': 'text/html' },
      }),
    );
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential unavailable',
    );
  });

  it('bounds streamed responses even when Content-Length is absent', async () => {
    const cancel = jest.fn();
    request.mockResolvedValueOnce(
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array(256 * 1024 + 1));
          },
          cancel,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential unavailable',
    );
    expect(cancel).toHaveBeenCalled();
  });

  it('rejects oversized declared responses before reading them', async () => {
    request.mockResolvedValueOnce(
      new Response('{}', {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '262145',
        },
      }),
    );
    await expect(getCredentialValue('testKey')).rejects.toThrow(
      'Credential unavailable',
    );
  });

  it('rejects browser execution before making a request', async () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {},
    });
    try {
      await expect(getCredentialValue('testKey')).rejects.toThrow(
        'Credential helpers are server-only',
      );
      expect(request).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(globalThis, 'window');
    }
  });
});
