import {
  buildPageElementTools,
  parseAgentsPageElements,
} from '@/agents/pageElements';
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition: unknown) => definition,
}));
const catalog = {
  snapshotId: '76f0586e-d3be-4d52-b175-2328319a2454',
  path: '/contacts',
  elements: [
    {
      id: 'element-1',
      label: 'Add customer',
      role: 'button',
      context: 'Customers',
    },
    {
      id: 'element-2',
      label: 'Нийт борлуулалт',
      role: 'td',
      context: 'Тайлан',
      frame: 'Sales report',
    },
  ],
};
interface ITool {
  execute(
    input: Record<string, unknown>,
    context: { requestContext: { get(key: string): unknown } },
  ): Promise<Record<string, unknown>>;
}
const run = async (
  tool: 'findPageElements' | 'focusPageElement',
  input: Record<string, unknown>,
  snapshot: unknown = catalog,
) => {
  const tools = await buildPageElementTools();
  return (tools[tool] as unknown as ITool).execute(input, {
    requestContext: {
      get: (key) => (key === 'pageElements' ? snapshot : undefined),
    },
  });
};
it('validates bounds and drops executable/extra metadata', () => {
  expect(
    parseAgentsPageElements({
      ...catalog,
      selector: 'body',
      elements: [{ ...catalog.elements[0], onclick: 'alert(1)' }],
    }),
  ).toEqual({ ...catalog, elements: [catalog.elements[0]] });
  expect(
    parseAgentsPageElements({ ...catalog, path: 'https://evil.example' }),
  ).toBeUndefined();
  expect(
    parseAgentsPageElements({
      ...catalog,
      elements: Array(241).fill(catalog.elements[0]),
    }),
  ).toBeUndefined();
  expect(
    parseAgentsPageElements({
      ...catalog,
      elements: [catalog.elements[0], catalog.elements[0]],
    }),
  ).toBeUndefined();
});
it('searches Unicode labels and returns exact run-scoped references', async () => {
  expect(await run('findPageElements', { query: 'борлуулалт' })).toMatchObject({
    snapshotId: catalog.snapshotId,
    elements: [{ id: 'element-2', frame: 'Sales report' }],
    total: 1,
  });
  expect(await run('findPageElements', { query: '', offset: 1 })).toMatchObject(
    { elements: [{ id: 'element-2' }] },
  );
});
it('never focuses a fabricated or stale reference', async () => {
  expect(
    await run('focusPageElement', {
      snapshotId: catalog.snapshotId,
      targetId: 'element-99',
      description: 'Here',
    }),
  ).toMatchObject({ status: 'unavailable' });
  expect(
    await run('focusPageElement', {
      snapshotId: '03575276-5617-4857-8965-c41c5ac08793',
      targetId: 'element-1',
      description: 'Here',
    }),
  ).toMatchObject({ status: 'unavailable' });
  expect(
    await run('findPageElements', { query: 'customer' }, undefined),
  ).toMatchObject({ total: 1 });
  expect(
    await run('findPageElements', { query: 'customer' }, null),
  ).toMatchObject({ elements: [], note: expect.any(String) });
});
it('returns a typed client request without claiming execution or accepting a selector', async () => {
  expect(
    await run('focusPageElement', {
      snapshotId: catalog.snapshotId,
      targetId: 'element-1',
      description: 'Use this to add a customer.',
    }),
  ).toEqual({
    kind: 'page-focus',
    version: 1,
    status: 'requested',
    snapshotId: catalog.snapshotId,
    targetId: 'element-1',
    path: '/contacts',
    title: 'Add customer',
    description: 'Use this to add a customer.',
  });
});
