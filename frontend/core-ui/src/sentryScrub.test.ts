import {
  FILTERED,
  isSensitiveKey,
  maskSecrets,
  scrubBrowserEvent,
} from './sentryScrub';

describe('sentryScrub (browser)', () => {
  test('reset-password and OAuth tokens in URLs never leave the browser', () => {
    const event = scrubBrowserEvent({
      exception: {
        values: [
          {
            type: 'TypeError',
            value: "Cannot read properties of undefined (reading 'list')",
          },
        ],
      },
      request: {
        url: 'https://office.example.io/reset-password?token=reset-abc123',
        headers: {
          Referer:
            'https://office.example.io/integrations/callback?code=oauth-code-1&state=st-1',
          'User-Agent': 'Mozilla/5.0',
        },
      },
      breadcrumbs: [
        {
          category: 'navigation',
          data: { from: '/login', to: '/reset-password?token=reset-abc123' },
        },
        {
          category: 'fetch',
          data: {
            url: 'https://office.example.io/gateway/graphql',
            status_code: 200,
          },
        },
      ],
      contexts: {
        graphql: {
          operation: 'Deals',
          kind: 'graphql',
          code: 'INTERNAL_SERVER_ERROR',
          status: 500,
        },
      },
      tags: {
        'graphql.operation': 'Deals',
        'graphql.code': 'INTERNAL_SERVER_ERROR',
      },
      transaction: '/reset-password',
    } as any) as any;
    const out = JSON.stringify(event);
    for (const secret of ['reset-abc123', 'oauth-code-1', 'st-1'])
      expect(out).not.toContain(secret);
    expect(event.request.url).toBe(
      `https://office.example.io/reset-password?token=${FILTERED}`,
    );
    expect(event.request.headers['User-Agent']).toBe('Mozilla/5.0');
    expect(event.breadcrumbs[1].data.url).toBe(
      'https://office.example.io/gateway/graphql',
    );
    expect(event.contexts.graphql.code).toBe('INTERNAL_SERVER_ERROR');
    expect(event.tags['graphql.code']).toBe('INTERNAL_SERVER_ERROR');
    expect(event.exception.values[0].value).toBe(
      "Cannot read properties of undefined (reading 'list')",
    );
  });

  test('implicit-flow tokens in the URL hash are masked', () => {
    expect(
      maskSecrets('https://x.io/cb#access_token=t-1&expires_in=3600'),
    ).toBe(`https://x.io/cb#access_token=${FILTERED}&expires_in=3600`);
  });

  test('sensitive key names', () => {
    expect(
      ['token', 'accessToken', 'password', 'Authorization'].every(
        isSensitiveKey,
      ),
    ).toBe(true);
    expect(['code', 'author', 'operation', 'status'].some(isSensitiveKey)).toBe(
      false,
    );
  });
});
