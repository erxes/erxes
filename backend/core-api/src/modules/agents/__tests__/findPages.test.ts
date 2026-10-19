import { buildFindPagesTool, rankNavigationEntries } from '@/agents/findPages';
import type { IAgentsNavigationEntry } from '@/agents/requestContext';

// Mastra's `createTool` wraps the user-provided execute with validation and a
// dispatcher; the contract under test is the definition itself.
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition) => definition,
}));

const catalog: IAgentsNavigationEntry[] = [
  { path: '/sales/deals', label: 'Deals', group: 'Sales' },
  { path: '/sales/pipelines', label: 'Pipelines', group: 'Sales' },
  { path: '/contacts/customers', label: 'Customers', group: 'Contacts' },
  {
    path: '/settings/agent/approvals',
    label: 'Approval settings',
    group: 'Settings · AI agents',
  },
];

const runTool = async (
  query: string,
  navigation: unknown,
): Promise<{ pages: unknown[]; note?: string }> => {
  const tool = (await buildFindPagesTool()) as unknown as {
    execute: (
      input: { query: string },
      context: { requestContext: { get(key: string): unknown } },
    ) => Promise<{ pages: unknown[]; note?: string }>;
  };

  return tool.execute(
    { query },
    {
      requestContext: {
        get: (key: string) => (key === 'navigation' ? navigation : undefined),
      },
    },
  );
};

describe('rankNavigationEntries', () => {
  it('ranks by token overlap across label, group and path segments', () => {
    const pages = rankNavigationEntries('sales pipeline', catalog);
    // 'sales' + 'pipeline' both hit the Pipelines entry (group + label).
    expect(pages[0]?.path).toBe('/sales/pipelines');
    expect(pages.length).toBeGreaterThan(0);
  });

  it('matches plurals via simple trailing-s stemming', () => {
    const pages = rankNavigationEntries('customers', catalog);
    expect(pages[0]?.path).toBe('/contacts/customers');
    expect(pages[0]?.label).toBe('Customers');
  });

  it('finds pages by words split across path segments', () => {
    const pages = rankNavigationEntries('approval settings', catalog);
    expect(pages[0]?.path).toBe('/settings/agent/approvals');
  });

  it('emits a decodable base64url page token', () => {
    const pages = rankNavigationEntries('deals', catalog);
    const deals = pages.find((page) => page.path === '/sales/deals');
    expect(deals?.reference).toBe(
      `[[page:${Buffer.from('/sales/deals').toString('base64url')}:Deals]]`,
    );
    expect(Buffer.from('/sales/deals').toString('base64url')).toMatch(
      /^[A-Za-z0-9_-]{1,64}$/,
    );
  });

  it('skips entries whose encoded path overflows the token id limit', () => {
    const pages = rankNavigationEntries('deep', [
      { path: `/${'a'.repeat(80)}`, label: 'deep page' },
    ]);
    expect(pages).toEqual([]);
  });

  it('returns an empty list for a blank query', () => {
    expect(rankNavigationEntries('   ', catalog)).toEqual([]);
  });
});

describe('findPages tool', () => {
  it('returns the unavailable note without a navigation snapshot', async () => {
    expect(await runTool('pipeline', undefined)).toEqual({
      pages: [],
      note: 'Page list unavailable for this client',
    });
    expect(await runTool('pipeline', [])).toEqual({
      pages: [],
      note: 'Page list unavailable for this client',
    });
  });

  it('ranks the snapshotted catalog', async () => {
    const result = await runTool('customers', catalog);
    const first = result.pages[0] as {
      label: string;
      group?: string;
      path: string;
      reference: string;
    };
    expect(first.label).toBe('Customers');
    expect(first.group).toBe('Contacts');
    expect(first.path).toBe('/contacts/customers');
    expect(first.reference).toMatch(/^\[\[ref:[a-f0-9-]{36}\]\]$/);
  });

  it('caps results at 8', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      path: `/page-${i}`,
      label: `page ${i}`,
    }));
    const result = await runTool('page', many);
    expect(result.pages.length).toBe(8);
  });

  it('exposes the verbatim description and a query-only input', async () => {
    const tool = (await buildFindPagesTool()) as {
      id: string;
      description: string;
    };
    expect(tool.id).toBe('findPages');
    expect(tool.description).toBe(
      'Find pages in the user\'s erxes workspace by what they are for, e.g. "sales pipeline", "customers", "approval settings". Input: { query }. Returns up to 8 matches, each with a page reference token; put the best match\'s token in your reply so the user can open the page with one click.',
    );
  });
});
