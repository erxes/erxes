import {
  parseAgentGraphqlOperation,
  requiresGraphqlApproval,
} from '@/agents/graphqlPolicy';

const expectPolicyError = (
  fn: () => unknown,
  code: string,
  message?: RegExp,
): void => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error & { code?: string }).code).toBe(code);
    if (message) {
      expect((error as Error).message).toMatch(message);
    }
    return;
  }

  throw new Error(`Expected a ${code} error`);
};

describe('parseAgentGraphqlOperation', () => {
  it('rejects an unparseable document', () => {
    expectPolicyError(
      () => parseAgentGraphqlOperation('{ customers {'),
      'GRAPHQL_PARSE_ERROR',
    );
  });

  it('rejects subscriptions', () => {
    expectPolicyError(
      () =>
        parseAgentGraphqlOperation(
          'subscription W { customersChanged { _id } }',
        ),
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      /subscription/i,
    );
  });

  it('rejects multiple operations without operationName', () => {
    expectPolicyError(
      () =>
        parseAgentGraphqlOperation(
          'query A { customers } mutation B { customersAdd(name: "x") { _id } }',
        ),
      'GRAPHQL_OPERATION_NOT_ALLOWED',
    );
  });

  it('rejects multiple operations even when one is named', () => {
    expect(() =>
      parseAgentGraphqlOperation(
        'query A { customers } mutation B { customersAdd(name: "x") { _id } }',
        'B',
      ),
    ).toThrow(/exactly one operation/);
  });

  it('rejects a missing operationName', () => {
    expectPolicyError(
      () => parseAgentGraphqlOperation('query A { customers }', 'B'),
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      /B/,
    );
  });

  it('collects root fields through inline fragments and named spreads', () => {
    const parsed = parseAgentGraphqlOperation(`
      query Q {
        customers { _id }
        ... on Query { deals { _id } }
        ...ExtraFields
      }
      fragment ExtraFields on Query { users { _id } }
    `);

    expect(parsed.operation).toBe('query');
    expect(parsed.rootFields.sort()).toEqual(['customers', 'deals', 'users']);
  });

  it('reports field names, not aliases', () => {
    const parsed = parseAgentGraphqlOperation(
      'query Q { mine: customers { _id } }',
    );

    expect(parsed.rootFields).toEqual(['customers']);
  });

  it.each([
    'login',
    'logout',
    'forgotPassword',
    'resetPassword',
    'usersChangePassword',
    'clientPortalUserLoginWithOTP',
  ])('denies the authentication root field %s', (field) => {
    expectPolicyError(
      () => parseAgentGraphqlOperation(`mutation M { ${field} }`),
      'GRAPHQL_OPERATION_NOT_ALLOWED',
      /restricted by the agent security policy/,
    );
  });
});

describe('requiresGraphqlApproval', () => {
  const parsedFor = (document: string) => parseAgentGraphqlOperation(document);

  it('never gates queries', () => {
    expect(requiresGraphqlApproval(parsedFor('{ customers }'), 'writes')).toBe(
      false,
    );
    expect(
      requiresGraphqlApproval(parsedFor('{ customers }'), 'destructive'),
    ).toBe(false);
  });

  it('gates every mutation in writes mode', () => {
    expect(
      requiresGraphqlApproval(parsedFor('mutation { customersAdd }'), 'writes'),
    ).toBe(true);
  });

  it('gates only high-risk mutations in destructive mode', () => {
    expect(
      requiresGraphqlApproval(
        parsedFor('mutation { customersRemove }'),
        'destructive',
      ),
    ).toBe(true);
    expect(
      requiresGraphqlApproval(
        parsedFor('mutation { customersAdd }'),
        'destructive',
      ),
    ).toBe(false);
  });
});

describe('system-operation deny policy', () => {
  it.each([
    'login',
    'appsAdd',
    'appDetail',
    'usersCreateOwner',
    'usersEdit',
    'agentsSettingsUpdate',
    'usersInvite',
    'permissionGroupsEdit',
    'agentsConnectionUpsert',
  ])('refuses %s even behind aliases', (field) => {
    expect(() =>
      parseAgentGraphqlOperation(
        `mutation Run { innocuous: ${field} { _id } }`,
      ),
    ).toThrow();
  });
  it('allows business operations without a procedure allowlist', () => {
    expect(
      parseAgentGraphqlOperation(
        'mutation NewPlugin { inventoryRecount { _id } }',
      ).rootFields,
    ).toEqual(['inventoryRecount']);
  });
});

it('does not mistake business names for authentication words', () => {
  expect(
    parseAgentGraphqlOperation(
      'query Products { hotProducts { _id } associations { _id } }',
    ).rootFields,
  ).toEqual(['hotProducts', 'associations']);
});

it('allows standard introspection, including aliased type lookups and schema fields', () => {
  const parsed = parseAgentGraphqlOperation(`
    query AgentsSalesTypeFields {
      deal: __type(name: "Deal") { fields { name } }
      currency: __type(name: "DealTotalCurrency") { fields { name } }
      pipeline: __type(name: "SalesPipeline") { fields { name } }
      schema: __schema { queryType { name } }
    }
  `);
  expect(parsed.rootFields).toEqual(['__type', '__schema']);
  expect(requiresGraphqlApproval(parsed, 'writes')).toBe(false);
  expect(requiresGraphqlApproval(parsed, 'destructive')).toBe(false);
});

it('still denies an actual account/security operation alongside introspection', () => {
  expect(() =>
    parseAgentGraphqlOperation(`
    query AgentsMixedIntrospection {
      __type(name: "Deal") { name }
      hidden: agentsConnections { provider }
    }
  `),
  ).toThrow(/agentsConnections.*restricted by the agent security policy/);
});



describe('nested credential policy', () => {
  it.each([
    'query AgentsPortal { getClientPortals { list { token } } }',
    'query AgentsPortal { getClientPortals { list { harmless: token } } }',
    'query AgentsPortal { getClientPortal { firebaseConfig { serviceAccountKey } } }',
    'query AgentsPortal { getClientPortal { ...AgentsCredentials } } fragment AgentsCredentials on ClientPortal { auth { tokiConfig { apiKey password } } }',
    'mutation AgentsPortal { clientPortalUpdate(clientPortal: {firebaseConfig: {serviceAccountKey: "dummy"}}) { _id } }',
    'mutation AgentsPortal($config: ClientPortalConfigInput = {firebaseConfig: {serviceAccountKey: "dummy"}}) { clientPortalUpdate(clientPortal: $config) { _id } }',
    'mutation AgentsPortal($key: String) { clientPortalUpdate(apiKey: $key) { _id } }',
  ])('refuses credential fields in selections, fragments and literal/default arguments: %s', (query) => {
    expect(() => parseAgentGraphqlOperation(query)).toThrow(/credential policy/);
  });

  it.each([
    {firebaseConfig: {serviceAccountKey: 'dummy'}},
    {auth: {tokiConfig: {apiKey: 'dummy'}}},
    {providers: [{clientSecret: 'dummy'}]},
    {config: {access_token: 'dummy'}},
    {config: {API_KEY: 'dummy'}},
  ])('refuses credentials inside supplied input objects: %j', (config) => {
    expect(() => parseAgentGraphqlOperation(
      'mutation AgentsPortal($input: ClientPortalConfigInput) { clientPortalUpdate(clientPortal: $input) { _id } }',
      undefined,
      {input: config},
    )).toThrow(/credential policy/);
  });

  it('does not inspect arbitrary text or variable/alias names as credentials', () => {
    expect(() => parseAgentGraphqlOperation(
      'mutation AgentsCustomer($password: CustomerInput) { token: customersAdd(customer: $password) { _id } }',
      undefined,
      {password: {firstName: 'Jane', description: 'Reset password instructions', data: [{name: 'Alice'}]}},
    )).not.toThrow();
  });

  it('allows schema metadata about credential fields', () => {
    expect(() => parseAgentGraphqlOperation(
      'query AgentsInspect($name: String!) { __type(name: $name) { fields { name type { name } } inputFields { name } } }',
      undefined,
      {name: 'FirebaseConfig'},
    )).not.toThrow();
  });
});
