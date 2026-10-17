import {
  parseAgentGraphqlOperation,
  requiresGraphqlApproval,
} from '@/agents/graphqlPolicy';

// graphqlPolicy imports HIGH_RISK_ACTION from tools.ts, which pulls in the
// agent-tools HTTP client. Mock it so the real erxes-api-shared barrel (and
// its eager redis client) never loads.
jest.mock('@/agents/agentTools', () => ({
  callAgentTool: jest.fn(),
  listAgentToolManifests: jest.fn(),
}));

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

  it('selects the named operation from a multi-operation document', () => {
    const parsed = parseAgentGraphqlOperation(
      'query A { customers } mutation B { customersAdd(name: "x") { _id } }',
      'B',
    );

    expect(parsed.operation).toBe('mutation');
    expect(parsed.rootFields).toEqual(['customersAdd']);
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
    expect(
      requiresGraphqlApproval(parsedFor('{ customers }'), 'writes'),
    ).toBe(false);
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
