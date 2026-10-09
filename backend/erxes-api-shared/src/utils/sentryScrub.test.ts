import {
  FILTERED,
  isSensitiveKey,
  maskSecrets,
  scrubRequestBody,
  scrubSentryEvent,
} from './sentryScrub';

// Fake connection string, assembled at runtime so secret scanners don't flag this file.
const FAKE_MONGO_URL = [
  'mongodb',
  '//app:FAKE-DB-PASSWORD@mongo.example:27017/erxes',
].join(':');

const leakedEvent = () =>
  ({
    exception: {
      values: [
        {
          type: 'MongoServerSelectionError',
          value: `connect ECONNREFUSED ${FAKE_MONGO_URL}?authSource=admin`,
        },
      ],
    },
    request: {
      method: 'POST',
      url: 'https://office.example.io/graphql?token=reset-abc123&tab=inbox',
      cookies: {
        'auth-token': 'eyJhbGciOiJIUzI1NiJ9.payload.sig',
        theme: 'dark',
      },
      headers: {
        cookie: 'auth-token=eyJhbGciOiJIUzI1NiJ9.payload.sig',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig',
        'erxes-app-token': 'app-token-value',
        'x-api-key': 'api-key-value',
        'content-type': 'application/json',
        referer: 'https://office.example.io/reset-password?token=reset-abc123',
        'user-agent': 'Mozilla/5.0',
      },
      query_string: 'access_token=fb-graph-token&limit=20',
      data: JSON.stringify({
        operationName: 'Login',
        query:
          'mutation Login { login(email: "a@b.mn", password: "Inline-Pw1") { token } }',
        variables: {
          email: 'a@b.mn',
          password: 'Var-Pw1',
          newPassword: 'New-Pw1',
        },
      }),
    },
    extra: {
      MONGO_URL: FAKE_MONGO_URL,
      apiKey: 'k-123',
      count: 3,
    },
    contexts: {
      graphql: {
        field: 'conversations',
        userId: 'u1',
        subdomain: 'officenext',
      },
    },
    breadcrumbs: [
      {
        category: 'http',
        data: {
          url: 'https://graph.facebook.com/v19.0/me?access_token=fb-graph-token',
          status_code: 400,
        },
      },
      {
        category: 'console',
        message: 'calling with Authorization: Bearer abc.def.ghi',
      },
    ],
    tags: { 'graphql.field': 'login', service: 'core' },
  } as any);

describe('sentryScrub', () => {
  test('nothing secret survives a leaky event', () => {
    const out = JSON.stringify(scrubSentryEvent(leakedEvent()));
    for (const secret of [
      'FAKE-DB-PASSWORD',
      'eyJhbGciOiJIUzI1NiJ9',
      'app-token-value',
      'api-key-value',
      'reset-abc123',
      'fb-graph-token',
      'Inline-Pw1',
      'Var-Pw1',
      'New-Pw1',
      'k-123',
      'abc.def.ghi',
    ]) {
      expect(out).not.toContain(secret);
    }
  });

  test('keeps what is needed to debug', () => {
    const event = scrubSentryEvent(leakedEvent());
    expect(event.request.cookies).toBeUndefined();
    expect(event.request.headers['content-type']).toBe('application/json');
    expect(event.request.headers['user-agent']).toBe('Mozilla/5.0');
    expect(event.request.headers.authorization).toBe(FILTERED);
    expect(event.request.url).toBe(
      `https://office.example.io/graphql?token=${FILTERED}&tab=inbox`,
    );
    expect(event.request.query_string).toBe(
      `access_token=${FILTERED}&limit=20`,
    );
    expect(event.exception.values[0].value).toBe(
      `connect ECONNREFUSED mongodb://${FILTERED}@mongo.example:27017/erxes?authSource=${FILTERED}`,
    );
    expect(event.extra.count).toBe(3);
    expect(event.contexts.graphql).toEqual({
      field: 'conversations',
      userId: 'u1',
      subdomain: 'officenext',
    });
    expect(event.breadcrumbs[0].data.status_code).toBe(400);
    expect(event.tags).toEqual({ 'graphql.field': 'login', service: 'core' });
  });

  test('GraphQL bodies keep their shape and numbers, not their values', () => {
    expect(
      scrubRequestBody(
        '{"query":"{ conversations(limit: 200, status: \\"open\\") { totalCount } }"}',
      ),
    ).toEqual({
      query: `{ conversations(limit: 200, status: "${FILTERED}") { totalCount } }`,
    });
    expect(
      scrubRequestBody({
        query: 'query Q { a }',
        variables: { id: 'x', input: { password: 'p' } },
      }),
    ).toEqual({
      query: 'query Q { a }',
      variables: { id: FILTERED, input: FILTERED },
    });
    expect(
      scrubRequestBody([
        { query: '{ a }' },
        { query: '{ b(s: """long secret""") }' },
      ]),
    ).toEqual([{ query: '{ a }' }, { query: `{ b(s: """${FILTERED}""") }` }]);
  });

  test('non-GraphQL and unparseable bodies are dropped', () => {
    expect(
      scrubRequestBody({
        object: 'page',
        entry: [{ messaging: [{ text: 'customer message' }] }],
      }),
    ).toBe(FILTERED);
    expect(scrubRequestBody('password=p&user=u')).toBe(FILTERED);
    expect(scrubRequestBody(undefined)).toBeUndefined();
  });

  test('sensitive key names', () => {
    for (const key of [
      'password',
      'newPassword',
      'auth-token',
      'erxes-app-token',
      'x-api-key',
      'apiKey',
      'client_secret',
      'Authorization',
      'set-cookie',
      'sessionId',
      'access_token',
      'refreshToken',
      'privateKey',
      'jwt',
    ]) {
      expect([key, isSensitiveKey(key)]).toEqual([key, true]);
    }
    for (const key of [
      'author',
      'authorId',
      'tokenizer',
      'publicKey',
      'subdomain',
      'userId',
      'limit',
      'shipping',
      'footprint',
    ]) {
      expect([key, isSensitiveKey(key)]).toEqual([key, false]);
    }
  });

  test('a bare query string (no leading ?) is masked too', () => {
    expect(maskSecrets('token=abc&limit=2')).toBe(`token=${FILTERED}&limit=2`);
    expect(
      maskSecrets(
        'https://x.io/integrations/callback?code=c-1&state=s-1&tab=2',
      ),
    ).toBe(
      `https://x.io/integrations/callback?code=${FILTERED}&state=${FILTERED}&tab=2`,
    );
    expect(
      scrubSentryEvent({
        contexts: { trace: { data: { 'http.query': 'token=abc' } } },
      } as any).contexts?.trace?.data,
    ).toEqual({
      'http.query': `token=${FILTERED}`,
    });
  });

  test('query strings sent as objects or pairs are masked the same way', () => {
    const scrub = (query_string: unknown) =>
      (scrubSentryEvent({ request: { query_string } } as any).request as any)
        .query_string;
    expect(scrub({ code: 'c-1', access_token: 't-1', limit: '20' })).toEqual({
      code: FILTERED,
      access_token: FILTERED,
      limit: '20',
    });
    expect(
      scrub([
        ['state', 's-1'],
        ['tab', '2'],
      ]),
    ).toEqual([
      ['state', FILTERED],
      ['tab', '2'],
    ]);
  });

  test('maskSecrets leaves ordinary text alone', () => {
    const text =
      'Cast to ObjectId failed for value "abc" at path "_id" (https://office.example.io/inbox?tab=1)';
    expect(maskSecrets(text)).toBe(text);
  });
});
