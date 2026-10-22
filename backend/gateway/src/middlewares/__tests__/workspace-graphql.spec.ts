import express from 'express';
import {
  buildSchema,
  getOperationAST,
  graphql,
  Kind,
  parse,
  print,
  validate,
  type FragmentDefinitionNode,
} from 'graphql';
import {
  applyWorkspaceGraphQL,
  createWorkspaceGatewaySchema,
  delegateDocument,
  type WorkspaceRequest,
} from '../workspace-graphql';

jest.mock('~/apollo-router', () => ({ apolloRouterPort: 50000 }));

const base = () =>
  buildSchema(
    'type Company { _id: String! name: String } type Query { health(prefix: String): String! companies: [Company!]! } type Mutation { oldWrite: String! }',
  );
const sdl = `type DataModel_asset { _id: String! serialNumber: String }
type DataModel_assetList { list: [DataModel_asset!]! totalCount: Int! }
extend type Company { serialNumber: String }
type DataModel_companyFields { _id: String! serialNumber: String }
extend type Query { dataModel_assetList(limit: Int): DataModel_assetList! dataModel_companyFields(_id: String!): DataModel_companyFields! }
extend type Mutation { dataModel_assetCreate: DataModel_asset! }`;
const context = (hostname = 'tenant-a'): WorkspaceRequest => ({
  core: 'http://core.test',
  headers: { hostname, user: 'gateway-established-identity' },
  response: express.response,
  errors: [],
  loads: new Map(),
});
const response = (data: Record<string, unknown>) =>
  new Response(JSON.stringify({ data }), {
    headers: { 'content-type': 'application/json' },
  });
afterEach(() => jest.restoreAllMocks());

it('hydrates nested relations on ordinary business queries with aliases, fragments and distinct pagination variables', async () => {
  const relationSDL = sdl
    .replace(
      'serialNumber: String }\ntype DataModel_assetList',
      'serialNumber: String owner: Company }\ntype DataModel_assetList',
    )
    .replace(
      'extend type Company { serialNumber: String }',
      'extend type Company { serialNumber: String assets(limit: Int): [DataModel_asset!] }',
    )
    .replace(
      'type DataModel_companyFields { _id: String! serialNumber: String }',
      'type DataModel_companyFields { _id: String! serialNumber: String assets(limit: Int): [DataModel_asset!] }',
    );
  const upstreamSchema = createWorkspaceGatewaySchema(
    base(),
    relationSDL,
    'upstream',
  ).schema;
  // Use schema SDL for the upstream so execution has normal default resolvers.
  const { printSchema } = await import('graphql');
  const executable = buildSchema(printSchema(upstreamSchema));
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (url, init) => {
      const payload = JSON.parse(String(init?.body));
      if (!String(url).includes('core.test')) {
        expect(payload.query).not.toContain('assets');
        return response({
          companies: [{ _id: 'company-a', __typename: 'Company' }],
        });
      }
      const result = await graphql({
        schema: executable,
        source: payload.query,
        variableValues: payload.variables,
        rootValue: {
          dataModel_companyFields: ({ _id }: { _id: string }) => ({
            _id,
            serialNumber: 'SN-C',
            assets: ({ limit }: { limit: number }) =>
              [
                {
                  _id: 'asset-a',
                  serialNumber: 'SN-A',
                  owner: { _id, name: 'Company A', serialNumber: 'SN-C' },
                },
                {
                  _id: 'asset-b',
                  serialNumber: 'SN-B',
                  owner: { _id, name: 'Company A', serialNumber: 'SN-C' },
                },
              ].slice(0, limit),
          }),
        },
      });
      expect(result.errors).toBeUndefined();
      return new Response(JSON.stringify(result));
    });
  const { schema } = createWorkspaceGatewaySchema(
    base(),
    relationSDL,
    'relations',
  );
  const result = await graphql({
    schema,
    contextValue: context(),
    variableValues: { _id: 1, second: 2 },
    source: `
    query dataModelRelationGateway($_id: Int!, $second: Int!) {
      companies { first: assets(limit: $_id) { ...AssetFields } second: assets(limit: $second) { _id } }
    }
    fragment AssetFields on DataModel_asset { id: _id owner { name serialNumber } }
  `,
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.companies).toEqual([
    {
      first: [
        { id: 'asset-a', owner: { name: 'Company A', serialNumber: 'SN-C' } },
      ],
      second: [{ _id: 'asset-a' }, { _id: 'asset-b' }],
    },
  ]);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it('keeps nested built-in selections already resolved by generated roots without rehydrating them', async () => {
  const relationSDL = sdl.replace(
    'serialNumber: String }\ntype DataModel_assetList',
    'serialNumber: String owner: Company }\ntype DataModel_assetList',
  );
  const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    response({
      dataModel_assetList: {
        list: [
          {
            _id: 'asset-a',
            owner: { _id: 'company-a', serialNumber: 'already-resolved' },
          },
        ],
        totalCount: 1,
      },
    }),
  );
  const { schema } = createWorkspaceGatewaySchema(
    base(),
    relationSDL,
    'nested',
  );
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelNestedGenerated { dataModel_assetList { list { _id owner { _id serialNumber } } } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.dataModel_assetList).toEqual({
    list: [
      {
        _id: 'asset-a',
        owner: { _id: 'company-a', serialNumber: 'already-resolved' },
      },
    ],
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});

const withHttpGateway = async (
  run: (url: string) => Promise<void>,
): Promise<void> => {
  const app = express();
  app.use((req, _res, next) => {
    if (req.headers['x-test-user']) req.headers.user = 'trusted-test-user';
    next();
  });
  applyWorkspaceGraphQL(
    app,
    () => 'http://core.test',
    () => ({ schema: base(), mtime: 987 }),
  );
  app.all('/graphql', (req, res) =>
    res.json({ fallback: true, parsed: req.body !== undefined }),
  );
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing HTTP test address');
  try {
    await run(`http://127.0.0.1:${address.port}/graphql`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
};

it('does not consume anonymous bodies or impose workspace limits on existing traffic', async () => {
  const nativeFetch = globalThis.fetch;
  const remote = jest.spyOn(globalThis, 'fetch');
  await withHttpGateway(async (url) => {
    const anonymous = await nativeFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: 'query { health }',
        variables: { padding: 'a'.repeat(2 * 1024 * 1024) },
      }),
    });
    expect(await anonymous.json()).toEqual({ fallback: true, parsed: false });
    const authenticated = await nativeFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user': 'yes' },
      body: JSON.stringify({
        query: `query { health(prefix: "${'a'.repeat(100001)}") }`,
        variables: { padding: 'a'.repeat(2 * 1024 * 1024) },
      }),
    });
    expect(authenticated.status).toBe(200);
    expect(await authenticated.json()).toEqual({
      fallback: true,
      parsed: true,
    });
  });
  expect(remote).not.toHaveBeenCalled();
});

it('leaves unknown platform fields on the existing router if workspace metadata is unavailable', async () => {
  const nativeFetch = globalThis.fetch;
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error('Core metadata unavailable'));
  await withHttpGateway(async (url) => {
    const result = await nativeFetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-user': 'yes' },
      body: JSON.stringify({ query: 'query { companies { unknownField } }' }),
    });
    expect(await result.json()).toEqual({ fallback: true, parsed: true });
  });
});

it('respects disabled deployment introspection for generated schemas', async () => {
  const environment = process.env.NODE_ENV;
  const introspection = process.env.INTROSPECTION;
  const nativeFetch = globalThis.fetch;
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    response({
      dataModelWorkspaceSchema: { version: 'introspection-policy', sdl },
    }),
  );
  process.env.NODE_ENV = 'production';
  process.env.INTROSPECTION = 'false';
  try {
    await withHttpGateway(async (url) => {
      const result = await nativeFetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-test-user': 'yes' },
        body: JSON.stringify({
          query: 'query { __type(name: "DataModel_asset") { name } }',
        }),
      });
      expect(result.status).toBe(400);
      expect(JSON.stringify(await result.json())).toContain('introspection');
    });
  } finally {
    if (environment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = environment;
    if (introspection === undefined) delete process.env.INTROSPECTION;
    else process.env.INTROSPECTION = introspection;
  }
});

it('serves workspace-specific introspection at the existing API schema', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch');
  const { schema } = createWorkspaceGatewaySchema(base(), sdl, 'tenant-a:v1');
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelIntrospection { __type(name: "DataModel_asset") { fields { name } } }',
  });
  expect(result.errors).toBeUndefined();
  expect(JSON.stringify(result.data)).toContain('serialNumber');
  expect(fetch).not.toHaveBeenCalled();
});

it('executes mixed platform and generated model queries, preserving aliases and variable scoping', async () => {
  const requests: string[] = [];
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const payload = JSON.parse(String(init?.body));
    requests.push(payload.query);
    if (String(url).includes('core.test'))
      return response({
        assets: {
          _id: 'ignored',
          list: [{ _id: 'a', sn: 'SN-1' }],
          totalCount: 1,
        },
      });
    expect(validate(base(), parse(payload.query))).toEqual([]);
    return response({ status: 'ok' });
  });
  const { schema } = createWorkspaceGatewaySchema(base(), sdl, 'tenant-a:v1');
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelMixed($prefix: String, $count: Int) { status: health(prefix: $prefix) assets: dataModel_assetList(limit: $count) { list { _id sn: serialNumber } totalCount } }',
    variableValues: { prefix: 'Hi', count: 5 },
  });
  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    status: 'ok',
    assets: { list: [{ _id: 'a', sn: 'SN-1' }], totalCount: 1 },
  });
  expect(requests.find((query) => query.includes('health'))).not.toContain(
    '$count',
  );
});

it('hydrates generated fields on existing business types and injects an unaliased identity', async () => {
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (url, init) => {
      const payload = JSON.parse(String(init?.body));
      if (String(url).includes('core.test'))
        return response({
          dataModel_companyFields: { serialNumber: 'company-extra' },
        });
      expect(payload.query).not.toContain('serialNumber');
      expect(payload.query).toContain('id: _id');
      expect(validate(base(), parse(payload.query))).toEqual([]);
      return response({
        companies: [
          { id: 'company-a', _id: 'company-a', __typename: 'Company' },
        ],
      });
    });
  const { schema } = createWorkspaceGatewaySchema(base(), sdl, 'tenant-a:v1');
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelBuiltinFields { companies { id: _id serialNumber } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.companies).toEqual([
    { id: 'company-a', serialNumber: 'company-extra' },
  ]);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('returns model field values and their write version inside an existing business query', async () => {
  const extended = sdl.replace(
    'extend type Company { serialNumber: String }',
    'extend type Company { serialNumber: String _dataModelVersion: Int }',
  );
  const upstream = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (url, init) => {
      const payload = JSON.parse(String(init?.body));
      if (String(url).includes('core.test')) {
        expect(payload.query).toContain('_dataModelVersion: version');
        return response({
          dataModel_companyFields: {
            serialNumber: 'SN-4',
            _dataModelVersion: 4,
          },
        });
      }
      expect(payload.query).not.toContain('_dataModelVersion');
      expect(payload.query).not.toContain('serialNumber');
      return response({
        companies: [{ _id: 'company-a', __typename: 'Company' }],
      });
    });
  const { schema } = createWorkspaceGatewaySchema(
    base(),
    extended,
    'business-version',
  );
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelExistingBusinessQuery { companies { _id serialNumber _dataModelVersion } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.companies).toEqual([
    { _id: 'company-a', serialNumber: 'SN-4', _dataModelVersion: 4 },
  ]);
  expect(upstream).toHaveBeenCalledTimes(2);
});

it('preserves aliases that shadow identities and typenames, even when the client skips its own identity field', async () => {
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const payload = JSON.parse(String(init?.body));
    if (String(url).includes('core.test')) {
      expect(payload.variables._id).toBe('company-a');
      return response({ dataModel_companyFields: { serialNumber: 'SN-3' } });
    }
    expect(validate(base(), parse(payload.query))).toEqual([]);
    const result = await graphql({
      schema: base(),
      source: payload.query,
      variableValues: payload.variables,
      rootValue: { companies: [{ _id: 'company-a', name: 'Company A' }] },
    });
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    });
  });
  const { schema } = createWorkspaceGatewaySchema(
    base(),
    sdl,
    'alias-identities',
  );
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'query dataModelShadowedAliases { companies { _id: name __typename: name hidden: _id @skip(if: true) __erxes_record_id: name serialNumber } }',
  });
  expect(result.errors).toBeUndefined();
  expect(result.data?.companies).toEqual([
    {
      _id: 'Company A',
      __typename: 'Company A',
      __erxes_record_id: 'Company A',
      serialNumber: 'SN-3',
    },
  ]);
});

it('keeps mutation execution serial across platform and model roots', async () => {
  const order: string[] = [];
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    order.push(String(url).includes('core.test') ? 'model' : 'platform');
    return String(url).includes('core.test')
      ? response({ dataModel_assetCreate: { _id: 'a' } })
      : response({ oldWrite: 'done' });
  });
  const { schema } = createWorkspaceGatewaySchema(base(), sdl, 'tenant-a:v1');
  const result = await graphql({
    schema,
    contextValue: context(),
    source:
      'mutation dataModelMixedWrites { oldWrite dataModel_assetCreate { _id } }',
  });
  expect(result.errors).toBeUndefined();
  expect(order).toEqual(['platform', 'model']);
});

it('delegates reachable fragments and removes unused variables, without losing directives', () => {
  const { schema, customFields } = createWorkspaceGatewaySchema(
    base(),
    sdl,
    'a',
  );
  const doc = parse(
    'query dataModelDelegation($show: Boolean!, $unused: Int) { companies { ...CompanyFields @include(if: $show) } dataModel_assetList(limit: $unused) { totalCount } } fragment CompanyFields on Company { _id serialNumber }',
  );
  const operation = getOperationAST(doc);
  if (!operation || operation.selectionSet.selections[0].kind !== Kind.FIELD)
    throw new Error('Invalid test operation');
  const fragments = new Map(
    doc.definitions
      .filter(
        (entry): entry is FragmentDefinitionNode =>
          entry.kind === Kind.FRAGMENT_DEFINITION,
      )
      .map((entry) => [entry.name.value, entry]),
  );
  const delegated = delegateDocument(
    schema,
    operation,
    operation.selectionSet.selections[0],
    fragments,
    customFields,
    true,
  );
  expect(validate(base(), delegated)).toEqual([]);
  expect(print(delegated)).toContain('@include(if: $show)');
  expect(print(delegated)).not.toContain('$unused');
  expect(print(delegated)).not.toContain('serialNumber');
});

it('never captures tenant identity inside a shared compiled schema', async () => {
  const tenants: string[] = [];
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
    const headers = new Headers(init?.headers);
    tenants.push(headers.get('hostname') ?? '');
    return response({ dataModel_assetList: { list: [], totalCount: 0 } });
  });
  const { schema } = createWorkspaceGatewaySchema(base(), sdl, 'same-shape');
  for (const tenant of ['tenant-a', 'tenant-b'])
    await graphql({
      schema,
      contextValue: context(tenant),
      source:
        'query dataModelTenantContext { dataModel_assetList { totalCount } }',
    });
  expect(tenants).toEqual(['tenant-a', 'tenant-b']);
});

it('updates authenticated /graphql introspection immediately when workspace field metadata changes', async () => {
  const nativeFetch = globalThis.fetch;
  let version = '1';
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (!String(url).startsWith('http://core.test'))
      return nativeFetch(url, init);
    const tenant = new Headers(init?.headers).get('nginx-hostname');
    const name =
      tenant === 'tenant-a.test'
        ? version === '1'
          ? 'firstField'
          : 'newField'
        : 'otherTenantField';
    return response({
      dataModelWorkspaceSchema: {
        version: `${tenant}:${version}`,
        sdl: `type DataModel_dynamic { ${name}: String } extend type Query { dataModel_dynamicDetail: DataModel_dynamic }`,
      },
    });
  });
  const app = express();
  app.use((req, _res, next) => {
    req.headers.user = 'gateway-established-user';
    req.headers['nginx-hostname'] = String(req.headers['x-test-tenant']);
    next();
  });
  applyWorkspaceGraphQL(
    app,
    () => 'http://core.test',
    () => ({ schema: base(), mtime: 42 }),
  );
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing test server address');
  const query = async (tenant: string) => {
    const result = await nativeFetch(
      `http://127.0.0.1:${address.port}/graphql`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-test-tenant': tenant,
        },
        body: JSON.stringify({
          query:
            'query dataModelHttpIntrospection { __type(name: "DataModel_dynamic") { fields { name } } }',
        }),
      },
    );
    expect(result.status).toBe(200);
    return JSON.stringify(await result.json());
  };
  try {
    expect(await query('tenant-a.test')).toContain('firstField');
    expect(await query('tenant-b.test')).toContain('otherTenantField');
    version = '2';
    const updated = await query('tenant-a.test');
    expect(updated).toContain('newField');
    expect(updated).not.toContain('otherTenantField');
    expect(updated).not.toContain('firstField');
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
