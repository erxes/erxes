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
      /authentication operations are not available/,
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
    'appsAdd', 'appDetail', 'usersCreateOwner', 'usersEdit', 'agentsSettingsUpdate',
    'usersInvite',
    'permissionGroupsEdit',
    'agentsConnectionUpsert',
    '__schema',
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
  expect(parseAgentGraphqlOperation('query Products { hotProducts { _id } associations { _id } }').rootFields).toEqual(['hotProducts', 'associations']);
});
