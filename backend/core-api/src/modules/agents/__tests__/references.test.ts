/**
 * Reference-token extraction tests.
 *
 * The guarantees under test:
 *
 * - every mapped tool family produces `[[type:id:label]]` tokens from single
 *   documents, arrays, and one-level list wrappers (`list`/`items`/`data`);
 * - labels fall back through their per-type field order and are sanitized
 *   (brackets/newlines stripped, whitespace collapsed, 80-char cap, id
 *   fallback when empty);
 * - records with malformed `_id`s are skipped; tokens are deduplicated and
 *   capped at 25; unknown tool ids produce none.
 */

import { extractAgentReferences } from '@/agents/references';

describe('extractAgentReferences', () => {
  it('maps core customers.* tools to customer tokens with a full name label', () => {
    const tokens = extractAgentReferences('customer', [
      {
        _id: 'cust1',
        firstName: 'Jane',
        lastName: 'Doe',
        primaryEmail: 'jane@example.com',
      },
    ]);

    expect(tokens).toEqual(['[[customer:cust1:Jane Doe]]']);
  });

  it('falls back through customer label fields to email, phone, then code', () => {
    expect(
      extractAgentReferences('customer', {
        _id: 'c1',
        primaryEmail: 'a@b.c',
      }),
    ).toEqual(['[[customer:c1:a@b.c]]']);

    expect(
      extractAgentReferences('customer', {
        _id: 'c2',
        primaryPhone: '+123',
      }),
    ).toEqual(['[[customer:c2:+123]]']);

    expect(
      extractAgentReferences('customer', {
        _id: 'c3',
        code: 'C-3',
      }),
    ).toEqual(['[[customer:c3:C-3]]']);
  });

  it('maps companies.* to company tokens preferring primaryName, then names[0], then email', () => {
    expect(
      extractAgentReferences('company', {
        _id: 'co1',
        primaryName: 'Acme',
        names: ['Acme LLC'],
      }),
    ).toEqual(['[[company:co1:Acme]]']);

    expect(
      extractAgentReferences('company', {
        _id: 'co2',
        names: ['Acme LLC', 'Other'],
      }),
    ).toEqual(['[[company:co2:Acme LLC]]']);

    expect(
      extractAgentReferences('company', {
        _id: 'co3',
        names: [],
        primaryEmail: 'info@acme.io',
      }),
    ).toEqual(['[[company:co3:info@acme.io]]']);
  });

  it('maps users.* to user tokens preferring details.fullName, then username, then email', () => {
    expect(
      extractAgentReferences('user', {
        _id: 'u1',
        details: { fullName: 'Full Name' },
        username: 'uname',
      }),
    ).toEqual(['[[user:u1:Full Name]]']);

    expect(
      extractAgentReferences('user', {
        _id: 'u2',
        username: 'uname',
        email: 'u@x.io',
      }),
    ).toEqual(['[[user:u2:uname]]']);

    expect(
      extractAgentReferences('user', {
        _id: 'u3',
        email: 'u@x.io',
      }),
    ).toEqual(['[[user:u3:u@x.io]]']);
  });

  it('maps products.* to product tokens (name, then code)', () => {
    expect(
      extractAgentReferences('product', {
        _id: 'p1',
        name: 'Tea',
      }),
    ).toEqual(['[[product:p1:Tea]]']);

    expect(
      extractAgentReferences('product', [{ _id: 'p2', code: 'P-2' }]),
    ).toEqual(['[[product:p2:P-2]]']);
  });

  it('excludes nested product routers (rules) from the product type', () => {
    expect(
      extractAgentReferences('unsupported', [{ _id: 'r1', name: 'rule' }]),
    ).toEqual([]);

    // productCategories / productUoms are different prefixes entirely.
    expect(
      extractAgentReferences('unsupported', [{ _id: 'cat1', name: 'Cat' }]),
    ).toEqual([]);
    expect(
      extractAgentReferences('unsupported', [{ _id: 'uom1', name: 'pc' }]),
    ).toEqual([]);
  });

  it('maps structure routers to branch/department/unit tokens (title, then code)', () => {
    expect(
      extractAgentReferences('branch', [{ _id: 'b1', title: 'HQ' }]),
    ).toEqual(['[[branch:b1:HQ]]']);
    expect(
      extractAgentReferences('department', {
        _id: 'd1',
        code: 'DEP-1',
      }),
    ).toEqual(['[[department:d1:DEP-1]]']);
    expect(
      extractAgentReferences('unit', [{ _id: 'un1', title: 'Unit A' }]),
    ).toEqual(['[[unit:un1:Unit A]]']);
  });

  it('maps brands.* and sales deal.*', () => {
    expect(
      extractAgentReferences('brand', {
        _id: 'br1',
        name: 'Brand X',
      }),
    ).toEqual(['[[brand:br1:Brand X]]']);
    expect(
      extractAgentReferences('deal', [{ _id: 'deal1', name: 'Big Order' }]),
    ).toEqual(['[[deal:deal1:Big Order]]']);
  });

  it('maps the agent write tools to customer/deal tokens by prefix', () => {
    expect(
      extractAgentReferences('customer', {
        _id: 'cust9',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).toEqual(['[[customer:cust9:Jane Doe]]']);

    expect(
      extractAgentReferences('deal', {
        _id: 'deal9',
        name: 'Big Order',
      }),
    ).toEqual(['[[deal:deal9:Big Order]]']);
  });

  it('maps frontline inbox.conversations.* to a 40-char content snippet or the id', () => {
    expect(
      extractAgentReferences('conversation', {
        _id: 'cv1',
        content:
          'This is a fairly long conversation content body that exceeds forty characters.',
      }),
    ).toEqual([
      '[[conversation:cv1:This is a fairly long conversation conte]]',
    ]);

    expect(
      extractAgentReferences('conversation', {
        _id: 'cv2',
      }),
    ).toEqual(['[[conversation:cv2:cv2]]']);
  });

  it('walks one-level list wrappers (list, items, data)', () => {
    for (const key of ['list', 'items', 'data']) {
      expect(
        extractAgentReferences('customer', {
          [key]: [{ _id: 'w1', firstName: 'A' }],
          total: 1,
        }),
      ).toEqual(['[[customer:w1:A]]']);
    }

    // A `data` document (not array) is picked up too.
    expect(
      extractAgentReferences('conversation', {
        status: 'success',
        data: { _id: 'cv9', content: 'hi' },
      }),
    ).toEqual(['[[conversation:cv9:hi]]']);
  });

  it('sanitizes labels: strips brackets and newlines, collapses whitespace, caps at 80 chars', () => {
    const tokens = extractAgentReferences('deal', {
      _id: 'd1',
      name: 'Evil ]] name\nwith   spaces [[',
    });

    expect(tokens).toEqual(['[[deal:d1:Evil name with spaces]]']);

    const long = 'x'.repeat(200);
    const longTokens = extractAgentReferences('deal', {
      _id: 'd2',
      name: long,
    });

    expect(longTokens).toEqual([`[[deal:d2:${'x'.repeat(80)}]]`]);
  });

  it('falls back to the id when the label sanitizes to empty', () => {
    expect(
      extractAgentReferences('deal', {
        _id: 'd3',
        name: ' ]] [ [',
      }),
    ).toEqual(['[[deal:d3:d3]]']);
  });

  it('skips documents without a well-formed string _id', () => {
    const tokens = extractAgentReferences('customer', [
      { _id: 'ok-1', firstName: 'Ok' },
      { _id: 'bad id!', firstName: 'Bad' },
      { _id: '', firstName: 'Empty' },
      { firstName: 'Missing' },
      { _id: 42, firstName: 'Numeric' },
      { _id: 'x'.repeat(65), firstName: 'TooLong' },
    ]);

    expect(tokens).toEqual(['[[customer:ok-1:Ok]]']);
  });

  it('deduplicates tokens by id and caps output at 25', () => {
    const docs = Array.from({ length: 30 }, (_, i) => ({
      _id: `id-${i % 27}`,
      name: `N${i}`,
    }));

    const tokens = extractAgentReferences('deal', docs);

    expect(new Set(tokens).size).toBe(tokens.length);
    expect(tokens).toHaveLength(25);
  });

  it('returns [] for unknown tool ids and non-record results', () => {
    expect(extractAgentReferences('unsupported', [{ _id: 't1' }])).toEqual([]);
    expect(extractAgentReferences('unknown.tool.id', { _id: 'x' })).toEqual([]);
    expect(extractAgentReferences('customer', 42)).toEqual([]);
    expect(extractAgentReferences('customer', null)).toEqual([]);
    expect(extractAgentReferences('customer', [])).toEqual([]);
  });
});

it('issues opaque handles and persists canonical reference metadata with native tool results', async () => {
  const { issueAgentReferences } = await import('@/agents/references');
  const issued = issueAgentReferences(['[[customer:c1:Jane]]']);
  expect(issued.references[0]).toMatch(/^\[\[ref:[a-f0-9-]{36}\]\]$/);
  expect(issued.referenceManifest.items[0]).toMatchObject({
    type: 'customer',
    id: 'c1',
    label: 'Jane',
  });
  const { convertMessages } = await import('@mastra/core/agent/message-list');
  const stored = convertMessages([
    {
      id: 'result',
      role: 'assistant' as const,
      parts: [
        {
          type: 'dynamic-tool' as const,
          toolName: 'callGraphql',
          toolCallId: 'call',
          state: 'output-available' as const,
          input: {},
          output: { status: 'ok', ...issued },
        },
      ],
    },
  ]).to('Mastra.V2');
  expect(JSON.stringify(stored)).toContain(
    issued.referenceManifest.items[0].handle,
  );
  expect(JSON.stringify(stored)).toContain('referenceManifest');
});
