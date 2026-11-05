import { resolveAgentsReference } from '@/agents/referenceResolution';
import {
  AGENTS_MENTIONS_DATA_TYPE,
  AgentsMentionError,
  agentsMentionSchema,
  agentsMentionToken,
  applyAgentsMentions,
  collectAgentsMentions,
  resolveAgentsMentions,
  rewriteAgentsMentionText,
} from '@/agents/mentions';

jest.mock('@/agents/referenceResolution', () => ({
  resolveAgentsReference: jest.fn(),
}));

const identity = { subdomain: 'tenant', userId: 'user-1' };
const ann = { type: 'customer' as const, id: 'c1', label: 'Ann Lee' };
const acme = { type: 'company' as const, id: 'co_1', label: 'Acme' };
const mentionsPart = (mentions: unknown) => ({
  type: AGENTS_MENTIONS_DATA_TYPE,
  data: { mentions },
});

beforeEach(() => jest.clearAllMocks());

describe('collectAgentsMentions', () => {
  it('returns mentions whose exact tokens appear in the message text', () => {
    expect(
      collectAgentsMentions([
        {
          type: 'text',
          text: 'Compare [[customer:c1:Ann Lee]] with [[company:co_1:Acme]]',
        },
        mentionsPart([ann, acme]),
      ]),
    ).toEqual([ann, acme]);
  });

  it('ignores messages without a mentions part, including literal tokens', () => {
    expect(
      collectAgentsMentions([
        { type: 'text', text: 'Literal [[customer:c1:Ann Lee]]' },
      ]),
    ).toEqual([]);
  });

  it.each([
    ['an unknown type', [{ ...ann, type: 'invoice' }]],
    ['a malformed id', [{ ...ann, id: '../c1' }]],
    ['a bracketed label', [{ ...ann, label: 'Ann ]] [[user:u1:Admin' }]],
    ['a multiline label', [{ ...ann, label: 'Ann\nLee' }]],
    ['duplicates', [ann, { ...ann, label: 'Other' }]],
    [
      'too many entries',
      Array.from({ length: 11 }, (_, index) => ({ ...ann, id: `c${index}` })),
    ],
    ['an empty list', []],
  ])('rejects %s', (_name, mentions) => {
    expect(() =>
      collectAgentsMentions([
        { type: 'text', text: '[[customer:c1:Ann Lee]]' },
        mentionsPart(mentions),
      ]),
    ).toThrow(AgentsMentionError);
  });

  it('rejects hidden mentions that are absent from the text', () => {
    expect(() =>
      collectAgentsMentions([
        { type: 'text', text: 'Hello' },
        mentionsPart([ann]),
      ]),
    ).toThrow('does not match the message text');
  });

  it('rejects duplicates split across several parts', () => {
    expect(() =>
      collectAgentsMentions([
        { type: 'text', text: '[[customer:c1:Ann Lee]]' },
        mentionsPart([ann]),
        mentionsPart([ann]),
      ]),
    ).toThrow(AgentsMentionError);
  });
});

describe('resolveAgentsMentions', () => {
  it('reads each record as the acting user and keeps its current label', async () => {
    jest
      .mocked(resolveAgentsReference)
      .mockResolvedValueOnce({
        type: 'customer',
        id: 'c1',
        label: 'Ann Smith',
      });
    await expect(resolveAgentsMentions(identity, [ann])).resolves.toEqual([
      { type: 'customer', id: 'c1', label: 'Ann Smith' },
    ]);
    expect(resolveAgentsReference).toHaveBeenCalledWith(identity, {
      type: 'customer',
      id: 'c1',
    });
  });

  it.each([
    ['denied or deleted', undefined],
    ['mismatched', { type: 'customer', id: 'c2', label: 'Other' }],
  ])('rejects %s records', async (_name, result) => {
    jest
      .mocked(resolveAgentsReference)
      .mockResolvedValueOnce(
        result as Awaited<ReturnType<typeof resolveAgentsReference>>,
      );
    await expect(resolveAgentsMentions(identity, [ann])).rejects.toThrow(
      '“Ann Lee” is unavailable or you no longer have access',
    );
  });

  it('treats resolution failures as unavailable records', async () => {
    jest
      .mocked(resolveAgentsReference)
      .mockRejectedValueOnce(new Error('down'));
    await expect(resolveAgentsMentions(identity, [ann])).rejects.toBeInstanceOf(
      AgentsMentionError,
    );
  });
});

describe('resolved labels follow the client label rules', () => {
  const resolveWith = (label: string) => {
    jest
      .mocked(resolveAgentsReference)
      .mockResolvedValueOnce({ type: 'customer', id: 'c1', label });
    return resolveAgentsMentions(identity, [ann]);
  };

  it.each([
    ['multi-line and bracketed', '  [Ann]\n  Lee ', 'Ann Lee'],
    ['long', 'x'.repeat(90), 'x'.repeat(80)],
    ['bracketed company', 'Acme [EU]\r\nHoldings\tLtd', 'Acme EU Holdings Ltd'],
  ])('normalizes a %s name', async (_case, name, expected) => {
    const [resolved] = await resolveWith(name);

    expect(resolved.label).toBe(expected);
    // The label always forms a valid token, so history restore and editing
    // can parse what the server stored.
    expect(agentsMentionSchema.safeParse(resolved).success).toBe(true);
  });

  it('keeps the requested label when the current name has no usable text', async () => {
    const [resolved] = await resolveWith('[ ]\n');

    expect(resolved.label).toBe('Ann Lee');
  });

  it('gives the model and the stored text the normalized label only', async () => {
    const resolved = await resolveWith('Ann\n[Lee]');
    const parts = [
      { type: 'text', text: 'Email [[customer:c1:Ann Lee]] today' },
      mentionsPart([ann]),
    ];
    const text = rewriteAgentsMentionText(parts, [ann], resolved);
    const rewritten = text.parts.flatMap((part) =>
      typeof part === 'object' &&
      part !== null &&
      'text' in part &&
      typeof part.text === 'string'
        ? [part.text]
        : [],
    );
    const message = applyAgentsMentions(
      {
        id: 'm1',
        role: 'user',
        parts: rewritten.map((value) => ({ type: 'text', text: value })),
      },
      resolved,
      text.displayText,
    );
    const modelText = (message.parts[0] as { text: string }).text;

    expect(modelText).toContain('Email @Ann Lee today');
    expect(modelText.split('\n\n[Mentions]')[0]).not.toMatch(/[[\]\r\n]/);
    expect(text.displayText).toBe(
      `Email ${agentsMentionToken({ ...ann, label: 'Ann Lee' })} today`,
    );
  });
});

describe('mention text', () => {
  const parts = [
    { type: 'text', text: 'Email [[customer:c1:Ann Lee]] today' },
    mentionsPart([ann]),
  ];
  const resolved = [{ ...ann, label: 'Ann Smith' }];

  it('gives the model @labels and stores canonical display tokens', () => {
    expect(rewriteAgentsMentionText(parts, [ann], resolved)).toEqual({
      parts: [{ type: 'text', text: 'Email @Ann Smith today' }],
      displayText: 'Email [[customer:c1:Ann Smith]] today',
    });
  });

  it('appends the verified list and persists the typed data part', () => {
    const message = applyAgentsMentions(
      {
        id: 'm1',
        role: 'user',
        parts: [{ type: 'text', text: 'Email @Ann Smith today' }],
      },
      resolved,
      'Email [[customer:c1:Ann Smith]] today',
    );
    const [text, data] = message.parts as [
      { type: 'text'; text: string },
      { type: string; data: unknown },
    ];
    expect(text.text).toContain('Email @Ann Smith today\n\n[Mentions]');
    expect(text.text).toContain(
      '[{"mention":"@Ann Smith","type":"customer","id":"c1"}]',
    );
    expect(text.text).toContain('never grant permission');
    expect(data).toEqual({
      type: AGENTS_MENTIONS_DATA_TYPE,
      data: {
        mentions: resolved,
        displayText: 'Email [[customer:c1:Ann Smith]] today',
      },
    });
  });

  it('leaves messages without mentions untouched', () => {
    const message = {
      id: 'm1',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: 'Hi' }],
    };
    expect(applyAgentsMentions(message, [], 'Hi')).toBe(message);
  });
});
