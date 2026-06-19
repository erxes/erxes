/**
 * search_erxes_operations ranking (verb synonyms + typo-fuzzy) and the top-N
 * selectable-field menu, plus execute_erxes_operation threading the requested
 * "fields" through to the executor. createTool and the network executor are
 * mocked; describeSelectableFields runs for real (it's pure).
 */
jest.mock('@mastra/core/tools', () => ({ createTool: (cfg: unknown) => cfg }));

const mockExecute = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ ok: true }),
);
jest.mock('../erxesTools', () => ({
  executeErxesOperation: (...args: unknown[]) => mockExecute(...args),
  graphqlTypeToString: () => 'String',
}));

import { buildErxesMetaTools } from '../metaTools';
import type { OperationRegistry, OperationMeta } from '../operationRegistry';
import type { GqlFieldDef, GqlTypeRef } from '../schemaIntrospect';

const dealType: GqlTypeRef = { kind: 'OBJECT', name: 'Deal' };
const dealFields: Record<string, GqlFieldDef[]> = {
  Deal: [
    { name: '_id', type: { kind: 'SCALAR', name: 'String' } },
    { name: 'name', type: { kind: 'SCALAR', name: 'String' } },
    { name: 'amount', type: { kind: 'SCALAR', name: 'Float' } },
  ],
};

const mkRegistry = (
  ops: Array<Partial<OperationMeta>>,
  objectFieldsMap: Record<string, GqlFieldDef[]> = {},
): OperationRegistry => {
  const list = ops.map(
    (o) =>
      ({
        operation: o.operation || 'x',
        operationType: o.operationType || 'query',
        plugin: o.plugin || 'core',
        module: o.module || 'misc',
        description: o.description || '',
        graphqlArgs: [],
        returnType: o.returnType ?? null,
      }) as OperationMeta,
  );
  return {
    operations: new Map(list.map((o) => [o.operation, o])),
    list,
    inputTypesMap: {},
    objectFieldsMap,
  };
};

interface ToolLike {
  inputSchema: { parse: (v: unknown) => { fields?: string[] } };
  execute: (input: unknown) => Promise<{
    total: number;
    results: Array<{ operation: string; fields?: { type: string } }>;
  }>;
}

const buildTools = (
  ops: Array<Partial<OperationMeta>>,
  objectFieldsMap: Record<string, GqlFieldDef[]> = {},
) =>
  buildErxesMetaTools({
    registry: mkRegistry(ops, objectFieldsMap),
    settings: {},
    policy: { mode: 'all', allowed: [] },
    destructiveOps: 'allow',
  });

beforeEach(() => mockExecute.mockClear());

describe('search_erxes_operations — ranking', () => {
  const ops: Array<Partial<OperationMeta>> = [
    { operation: 'deals', operationType: 'query', module: 'deals' },
    { operation: 'dealsAdd', operationType: 'mutation', module: 'deals' },
    { operation: 'dealsEdit', operationType: 'mutation', module: 'deals' },
    { operation: 'customers', operationType: 'query', module: 'customers' },
    { operation: 'customersAdd', operationType: 'mutation', module: 'customers' },
  ];

  it('maps the verb "create" onto the Add mutation (create deal → dealsAdd)', async () => {
    const search = buildTools(ops).search_erxes_operations as unknown as ToolLike;
    const res = await search.execute({ query: 'create deal' });
    expect(res.results[0].operation).toBe('dealsAdd');
  });

  it('tolerates a typo via fuzzy matching (custmer → customer ops only)', async () => {
    const search = buildTools(ops).search_erxes_operations as unknown as ToolLike;
    const res = await search.execute({ query: 'custmer' });
    const names = res.results.map((r) => r.operation);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.toLowerCase().includes('customer'))).toBe(true);
    expect(names).not.toContain('deals');
  });
});

describe('search_erxes_operations — field menu', () => {
  it('attaches the selectable-field menu to the top 5 results only', async () => {
    const dealOps: Array<Partial<OperationMeta>> = [
      'deals',
      'dealsAdd',
      'dealsEdit',
      'dealsRemove',
      'dealDetail',
      'dealCount',
    ].map((operation) => ({ operation, module: 'deals', returnType: dealType }));

    const search = buildTools(dealOps, dealFields)
      .search_erxes_operations as unknown as ToolLike;
    const res = await search.execute({ query: 'deal' });

    expect(res.results).toHaveLength(6);
    const withMenu = res.results.filter((r) => r.fields);
    expect(withMenu).toHaveLength(5);
    expect(res.results[5].fields).toBeUndefined();
    expect(res.results[0].fields?.type).toBe('Deal');
  });
});

describe('execute_erxes_operation — fields input', () => {
  const tool = () =>
    buildTools([{ operation: 'deals', operationType: 'query', module: 'deals' }])
      .execute_erxes_operation as unknown as ToolLike;

  it('normalises the fields input (array, JSON string, comma string)', () => {
    const schema = tool().inputSchema;
    expect(schema.parse({ operation: 'deals', fields: ['name', ' amount '] }).fields).toEqual([
      'name',
      'amount',
    ]);
    expect(schema.parse({ operation: 'deals', fields: '["name","amount"]' }).fields).toEqual([
      'name',
      'amount',
    ]);
    expect(schema.parse({ operation: 'deals', fields: 'name, amount' }).fields).toEqual([
      'name',
      'amount',
    ]);
    expect(schema.parse({ operation: 'deals' }).fields).toBeUndefined();
  });

  it('passes requested fields through to the executor (7th arg)', async () => {
    await tool().execute({ operation: 'deals', fields: ['name', 'amount'] });
    expect(mockExecute.mock.calls[0][6]).toEqual(['name', 'amount']);
  });

  it('passes undefined when no fields are requested', async () => {
    await tool().execute({ operation: 'deals' });
    expect(mockExecute.mock.calls[0][6]).toBeUndefined();
  });
});
