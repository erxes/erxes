import { buildSchema } from 'graphql';
import { buildGraphqlTools, loadMergedSchema } from '@/agents/graphqlTools';
import {
  agentsReferenceLookupSchema,
  referenceLookupOperation,
  resolveAgentsReference,
} from '@/agents/referenceResolution';
jest.mock('@/agents/graphqlTools', () => ({
  buildGraphqlTools: jest.fn(),
  loadMergedSchema: jest.fn(),
}));
const schema = buildSchema(
  'type Customer { _id: String! firstName: String lastName: String } type Pipeline { _id: String! boardId: String } type Deal { _id: String! name: String boardId: String pipeline: Pipeline } type Query { customerDetail(_id: String!): Customer dealDetail(_id: String!): Deal }',
);
const execute = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(loadMergedSchema).mockResolvedValue(schema);
  jest
    .mocked(buildGraphqlTools)
    .mockResolvedValue({ callGraphql: { execute } } as unknown as Awaited<
      ReturnType<typeof buildGraphqlTools>
    >);
});
it('verifies the schema return type and binds ids as variables', () => {
  const field = schema.getQueryType()?.getFields().customerDetail;
  expect(referenceLookupOperation(field, 'deal')).toBeUndefined();
  expect(referenceLookupOperation(field, 'customer')).toContain(
    'node: customerDetail(_id: $id)',
  );
  expect(
    agentsReferenceLookupSchema.safeParse({ type: 'customer', id: '../wrong' })
      .success,
  ).toBe(false);
});
it('uses the acting identity and current API record instead of a model label', async () => {
  execute.mockResolvedValue({
    status: 'ok',
    data: { node: { _id: 'c1', firstName: 'Current', lastName: 'Name' } },
  });
  expect(
    await resolveAgentsReference(
      { subdomain: 'tenant', userId: 'user-1' },
      { type: 'customer', id: 'c1' },
    ),
  ).toEqual({ type: 'customer', id: 'c1', label: 'Current Name' });
  expect(execute.mock.calls[0][0].variables).toEqual({ id: 'c1' });
  expect(execute.mock.calls[0][1].requestContext.get('userId')).toBe('user-1');
  expect(execute.mock.calls[0][1].requestContext.get('subdomain')).toBe(
    'tenant',
  );
});
it('does not resolve deleted, denied or mismatched records', async () => {
  for (const result of [
    { status: 'error', error: 'denied' },
    { status: 'ok', data: { node: null } },
    { status: 'ok', data: { node: { _id: 'other', firstName: 'Wrong' } } },
  ]) {
    execute.mockResolvedValue(result);
    expect(
      await resolveAgentsReference(
        { subdomain: 'tenant', userId: 'user-1' },
        { type: 'customer', id: 'c1' },
      ),
    ).toBeUndefined();
  }
});
it('returns the current sales board/pipeline and never invents missing routing metadata', async () => {
  execute.mockResolvedValue({
    status: 'ok',
    data: {
      node: {
        _id: 'd1',
        name: 'Deal',
        pipeline: { _id: 'new-pipeline', boardId: 'new-board' },
      },
    },
  });
  expect(
    await resolveAgentsReference(
      { subdomain: 'tenant', userId: 'user-1' },
      { type: 'deal', id: 'd1' },
    ),
  ).toMatchObject({
    location: { boardId: 'new-board', pipelineId: 'new-pipeline' },
  });
  execute.mockResolvedValue({
    status: 'ok',
    data: { node: { _id: 'd1', name: 'Deal', pipeline: null } },
  });
  expect(
    await resolveAgentsReference(
      { subdomain: 'tenant', userId: 'user-1' },
      { type: 'deal', id: 'd1' },
    ),
  ).toBeUndefined();
});
