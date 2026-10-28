import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

jest.mock('erxes-api-shared/utils/redis', () => ({ redis: {} }));

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/headers'),
  ...jest.requireActual('erxes-api-shared/utils/agent-tools'),
  ...jest.requireActual('erxes-api-shared/utils/trpc/context-header'),
}));

// Write the router config into a throwaway directory instead of src/.
jest.mock('~/apollo-router/paths', () => {
  const dir = jest
    .requireActual<typeof import('fs')>('fs')
    .mkdtempSync(
      jest
        .requireActual<typeof import('path')>('path')
        .join(
          jest.requireActual<typeof import('os')>('os').tmpdir(),
          'router-',
        ),
    );

  return {
    dirTempPath: dir,
    routerConfigPath: `${dir}/router.yaml`,
    routerPath: `${dir}/router`,
    supergraphPath: `${dir}/supergraph.graphql`,
    supergraphConfigPath: `${dir}/supergraph.yaml`,
  };
});

import { createRouterConfig } from '~/apollo-router';
import { parseExtraPropagatedHeaders } from '~/apollo-router/headers';
import { routerConfigPath } from '~/apollo-router/paths';

type HeaderRule = { propagate?: { named?: string; matching?: string } };

// The header rules of the router.yaml the gateway hands to Apollo Router.
const writtenRequestRules = async (extra?: string): Promise<HeaderRule[]> => {
  if (extra === undefined) {
    delete process.env.APOLLO_ROUTER_PROPAGATE_HEADERS;
  } else {
    process.env.APOLLO_ROUTER_PROPAGATE_HEADERS = extra;
  }

  await createRouterConfig();

  return yaml.parse(fs.readFileSync(routerConfigPath, 'utf8')).headers.all
    .request;
};

// Mirrors Apollo Router: `named` is an exact match, `matching` a regex.
const isPropagated = (rules: HeaderRule[], header: string) =>
  rules.some(
    ({ propagate }) =>
      propagate?.named === header ||
      (propagate?.matching !== undefined &&
        new RegExp(`^(?:${propagate.matching})$`).test(header)),
  );

describe('router header propagation (written router.yaml)', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  afterAll(() => {
    fs.rmSync(path.dirname(routerConfigPath), { recursive: true, force: true });
    delete process.env.APOLLO_ROUTER_PROPAGATE_HEADERS;
  });

  it.each([
    'erxes-subdomain',
    'x-erxes-agent-auth',
    'x-trpc-context',
    'x-trpc-context-signature',
    'x-some-unlisted-header',
    'host',
    'content-length',
  ])('does not forward %s to subgraphs', async (header) => {
    expect(isPropagated(await writtenRequestRules(), header)).toBe(false);
  });

  it.each([
    'user',
    'userid',
    'cpuser',
    'clientportal',
    'x-erxes-identity-signature',
    'hostname',
    'nginx-hostname',
  ])('forwards the gateway-minted %s', async (header) => {
    expect(isPropagated(await writtenRequestRules(), header)).toBe(true);
  });

  it.each([
    'cookie',
    'authorization',
    'sessioncode',
    'x-app-token',
    'client-auth-token',
    'erxes-widget-token',
    'erxes-pos-token',
    'origin',
    'x-forwarded-for',
    'x-erxes-process-id',
  ])('forwards %s, which subgraph resolvers read', async (header) => {
    expect(isPropagated(await writtenRequestRules(), header)).toBe(true);
  });

  it('forwards headers an operator adds for a plugin', async () => {
    const rules = await writtenRequestRules(' X-Plugin-Header , x-other ');

    expect(isPropagated(rules, 'x-plugin-header')).toBe(true);
    expect(isPropagated(rules, 'x-other')).toBe(true);
  });

  it('never forwards internal credentials even when an operator adds them', async () => {
    const rules = await writtenRequestRules(
      'x-trpc-context,x-erxes-agent-auth,erxes-subdomain',
    );

    expect(isPropagated(rules, 'x-trpc-context')).toBe(false);
    expect(isPropagated(rules, 'x-erxes-agent-auth')).toBe(false);
    expect(isPropagated(rules, 'erxes-subdomain')).toBe(false);
  });

  it('ignores names that are not valid header names', () => {
    expect(parseExtraPropagatedHeaders('bad header,x-ok')).toEqual(['x-ok']);
  });
});
