jest.mock('erxes-api-shared/utils/redis', () => ({ redis: {} }));

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/headers'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools'),
  ...jest.requireActual('erxes-api-shared/utils/trpc/context-header'),
}));

import {
  getRouterHeadersConfig,
  parseExtraPropagatedHeaders,
  ROUTER_PROPAGATED_HEADERS,
} from '~/apollo-router/headers';

const propagatedNames = (config: ReturnType<typeof getRouterHeadersConfig>) =>
  config.all.request.map((rule) => rule.propagate.named);

describe('router header propagation', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('propagates only named headers, never a wildcard', () => {
    const config = getRouterHeadersConfig('');

    for (const rule of config.all.request) {
      expect(Object.keys(rule)).toEqual(['propagate']);
      expect(Object.keys(rule.propagate)).toEqual(['named']);
    }
    expect(JSON.stringify(config)).not.toContain('matching');
  });

  it('forwards the identity minted and signed by the gateway', () => {
    expect(propagatedNames(getRouterHeadersConfig(''))).toEqual(
      expect.arrayContaining([
        'user',
        'userid',
        'cpuser',
        'clientportal',
        'x-erxes-identity-signature',
        'hostname',
        'nginx-hostname',
      ]),
    );
  });

  it('keeps client context that subgraphs read', () => {
    expect(propagatedNames(getRouterHeadersConfig(''))).toEqual(
      expect.arrayContaining([
        'cookie',
        'authorization',
        'sessioncode',
        'x-app-token',
        'erxes-widget-token',
        'origin',
        'x-forwarded-for',
        'x-erxes-process-id',
      ]),
    );
  });

  it.each([
    'erxes-subdomain',
    'x-erxes-agent-auth',
    'x-trpc-context',
    'x-trpc-context-signature',
    'x-custom-unknown',
    'host',
    'content-length',
  ])('does not propagate %s', (name) => {
    expect(propagatedNames(getRouterHeadersConfig(''))).not.toContain(name);
  });

  it('adds operator-configured headers', () => {
    const names = propagatedNames(
      getRouterHeadersConfig(' X-Plugin-Header , x-other '),
    );

    expect(names).toEqual(
      expect.arrayContaining(['x-plugin-header', 'x-other']),
    );
    expect(names.length).toBe(ROUTER_PROPAGATED_HEADERS.length + 2);
  });

  it('refuses internal credentials and invalid names from configuration', () => {
    expect(
      parseExtraPropagatedHeaders(
        'x-trpc-context,x-erxes-agent-auth,erxes-subdomain,bad header,user',
      ),
    ).toEqual(['user']);
    expect(warn).toHaveBeenCalledTimes(4);
  });
});
