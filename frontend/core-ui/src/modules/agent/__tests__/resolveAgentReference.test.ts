import { resolveAgentReference } from '../references/resolveAgentReference';
jest.mock('../api', () => ({
  AGENTS_REFERENCE_RESOLVE_URL: '/agents/references/resolve',
}));
const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});
it('uses a fixed endpoint, authenticated request and canonical identity only', async () => {
  const fetchMock = jest.fn(async () => ({
    ok: true,
    json: async () => ({
      reference: { type: 'customer', id: 'c1', label: 'Current name' },
    }),
  }));
  global.fetch = fetchMock as unknown as typeof fetch;
  expect(
    await resolveAgentReference({
      type: 'customer',
      id: 'c1',
      label: 'Old name',
    }),
  ).toEqual({ type: 'customer', id: 'c1', label: 'Current name' });
  expect(fetchMock.mock.calls[0]).toEqual([
    '/agents/references/resolve',
    expect.objectContaining({
      credentials: 'include',
      body: JSON.stringify({ type: 'customer', id: 'c1' }),
    }),
  ]);
});
it('rejects a response for a different identity or a denied record', async () => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({
      reference: { type: 'company', id: 'other', label: 'Wrong' },
    }),
  })) as unknown as typeof fetch;
  await expect(
    resolveAgentReference({ type: 'customer', id: 'c1', label: 'Jane' }),
  ).rejects.toThrow('Could not verify');
  global.fetch = jest.fn(async () => ({
    ok: false,
  })) as unknown as typeof fetch;
  await expect(
    resolveAgentReference({ type: 'customer', id: 'c1', label: 'Jane' }),
  ).rejects.toThrow('unavailable');
});
