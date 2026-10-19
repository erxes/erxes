/** @jest-environment jsdom */
import { AGENT_REFERENCE_TARGETS } from '../references/agentReferenceTargets';
import { getPageRecordFromLocation } from '../references/getPageRecordFromLocation';
import { AGENT_REFERENCE_TYPES } from '../references/parseAgentReferences';

describe('agentReferenceTargets', () => {
  it('has an entry for every reference type', () => {
    for (const type of AGENT_REFERENCE_TYPES) {
      expect(AGENT_REFERENCE_TARGETS[type]).toBeDefined();
    }
  });

  it('builds the expected path for every type', () => {
    const cases: [keyof typeof AGENT_REFERENCE_TARGETS, string][] = [
      ['customer', '/contacts/customers?contactId=x1'],
      ['company', '/contacts/companies?companyId=x1'],
      ['user', '/settings/team/members?user_id=x1'],
      ['product', '/settings/products?product_id=x1'],
      ['branch', '/settings/structures/branches?branch_id=x1'],
      ['department', '/settings/structures/departments?department_id=x1'],
      ['unit', '/settings/structures/units?unit_id=x1'],
      ['brand', '/settings/brands?brand_id=x1'],
      ['conversation', '/frontline/inbox?conversationId=x1'],
    ];

    for (const [type, expected] of cases) {
      expect(AGENT_REFERENCE_TARGETS[type].path('x1')).toBe(expected);
    }
  });

  it('requires verified location metadata for a deal and never guesses a page path', () => {
    expect(AGENT_REFERENCE_TARGETS.deal.path('d1')).toBeNull();
    expect(AGENT_REFERENCE_TARGETS.page.path('anything')).toBeNull();
    expect(
      AGENT_REFERENCE_TARGETS.deal.path('d1', {
        boardId: 'b1',
        pipelineId: 'p1',
      }),
    ).toBe('/sales/deals?boardId=b1&pipelineId=p1&salesItemId=d1');
  });

  it('marks plugin-backed targets', () => {
    expect(AGENT_REFERENCE_TARGETS.deal.pluginRemote).toBe('sales_ui');
    expect(AGENT_REFERENCE_TARGETS.conversation.pluginRemote).toBe(
      'frontline_ui',
    );
    expect(AGENT_REFERENCE_TARGETS.customer.pluginRemote).toBeUndefined();
  });
});

describe('getPageRecordFromLocation', () => {
  it('recognizes every target path', () => {
    const cases: [string, string, string][] = [
      ['/contacts/customers', '?contactId=c1', 'customer'],
      ['/contacts/companies', '?companyId=c2', 'company'],
      ['/settings/team/members', '?user_id=u1', 'user'],
      ['/settings/products', '?product_id=p1', 'product'],
      ['/settings/structures/branches', '?branch_id=b1', 'branch'],
      ['/settings/structures/departments', '?department_id=d1', 'department'],
      ['/settings/structures/units', '?unit_id=u2', 'unit'],
      ['/settings/brands', '?brand_id=b2', 'brand'],
      ['/sales/deals', '?salesItemId=s1', 'deal'],
      ['/frontline/inbox', '?conversationId=i1', 'conversation'],
    ];

    for (const [pathname, search, type] of cases) {
      expect(getPageRecordFromLocation(pathname, search)).toEqual({
        type,
        id: expect.any(String),
      });
    }
  });

  it('returns the param value', () => {
    expect(
      getPageRecordFromLocation('/sales/deals', '?salesItemId=abc123'),
    ).toEqual({ type: 'deal', id: 'abc123' });
  });

  it('returns undefined on unrelated pages or missing params', () => {
    expect(getPageRecordFromLocation('/agent', '')).toBeUndefined();
    expect(
      getPageRecordFromLocation('/contacts/customers', ''),
    ).toBeUndefined();
    expect(
      getPageRecordFromLocation('/sales/deals', '?other=1'),
    ).toBeUndefined();
  });
});

describe('decodeAgentPagePath', () => {
  const encode = (path: string) =>
    Buffer.from(path, 'utf8').toString('base64url');

  it('round-trips a catalog path', async () => {
    const { decodeAgentPagePath } = await import(
      '../references/agentReferenceTargets'
    );
    expect(decodeAgentPagePath(encode('/sales/deals'))).toBe('/sales/deals');
    expect(decodeAgentPagePath(encode('/settings/agent/appearance'))).toBe(
      '/settings/agent/appearance',
    );
  });

  it('rejects malformed, foreign, and control-char encodings', async () => {
    const { decodeAgentPagePath } = await import(
      '../references/agentReferenceTargets'
    );
    expect(decodeAgentPagePath('%%%not-base64')).toBeNull();
    expect(decodeAgentPagePath(encode('no-leading-slash'))).toBeNull();
    expect(decodeAgentPagePath(encode('https://evil.example'))).toBeNull();
    expect(decodeAgentPagePath(encode('//evil.example'))).toBeNull();
    expect(decodeAgentPagePath(encode('/\\evil.example'))).toBeNull();
    expect(decodeAgentPagePath(encode('/evil\npath'))).toBeNull();
    expect(decodeAgentPagePath('')).toBeNull();
  });
});
