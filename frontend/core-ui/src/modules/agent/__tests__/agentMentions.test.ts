import {
  AGENTS_MENTIONS_DATA_TYPE,
  agentMentionsDisplayText,
  agentMentionsPartsForText,
  readAgentMentions,
  withAgentMentionsParts,
} from '../agentMentions';
import { decodeInFlightPrompt } from '../inFlightPrompt';
import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';
import { buildThreadMarkdown } from '../utils/exportThreadMarkdown';

const ann = { type: 'customer', id: 'c1', label: 'Ann Lee' } as const;
const wire = 'Email [[customer:c1:Ann Lee]] today';

it('derives the structured part from wire text', () => {
  expect(agentMentionsPartsForText(wire)).toEqual([
    { type: AGENTS_MENTIONS_DATA_TYPE, data: { mentions: [ann] } },
  ]);
  expect(agentMentionsPartsForText('No mentions')).toEqual([]);
});

it('reads only valid mention parts', () => {
  expect(
    readAgentMentions([
      { type: 'text', text: wire },
      { type: AGENTS_MENTIONS_DATA_TYPE, data: { mentions: [ann] } },
      {
        type: AGENTS_MENTIONS_DATA_TYPE,
        data: { mentions: [{ ...ann, type: 'page' }] },
      },
    ]),
  ).toEqual([ann]);
});

it('replaces a turn’s mentions with those of its edited text', () => {
  const parts = withAgentMentionsParts(
    [
      { type: 'text', text: 'old [[company:co_1:Acme]]' },
      {
        type: AGENTS_MENTIONS_DATA_TYPE,
        data: { mentions: [{ type: 'company', id: 'co_1', label: 'Acme' }] },
      },
    ],
    wire,
  );
  expect(readAgentMentions(parts)).toEqual([ann]);
  expect(withAgentMentionsParts(parts, 'plain')).toEqual([
    { type: 'text', text: 'old [[company:co_1:Acme]]' },
  ]);
});

it('restores the canonical display text and keeps the page context line', () => {
  const [message] = mapStoredMessagesToUIMessages([
    {
      id: 'm1',
      role: 'user',
      createdAt: '2026-10-01T00:00:00.000Z',
      content: {
        format: 2,
        parts: [
          {
            type: 'text',
            text: '[Page context] The user is viewing /contacts.',
          },
          { type: 'text', text: 'Email @Ann Lee today\n\n[Mentions] …' },
          {
            type: AGENTS_MENTIONS_DATA_TYPE,
            data: { mentions: [ann], displayText: wire },
          },
        ],
      },
    },
  ]);
  expect(message.parts).toEqual([
    { type: 'text', text: '[Page context] The user is viewing /contacts.' },
    { type: 'text', text: wire },
    {
      type: AGENTS_MENTIONS_DATA_TYPE,
      data: { mentions: [ann], displayText: wire },
    },
  ]);
  expect(agentMentionsDisplayText(message.parts)).toBe(wire);
});

it('restores mention data for in-flight prompts', () => {
  expect(decodeInFlightPrompt(wire)).toEqual([
    { type: 'text', text: wire },
    { type: AGENTS_MENTIONS_DATA_TYPE, data: { mentions: [ann] } },
  ]);
});

it('exports mentions as their record names', () => {
  const markdown = buildThreadMarkdown({
    title: 'Mentions',
    exportedAt: new Date('2026-10-01T00:00:00.000Z'),
    messages: [
      {
        id: 'm1',
        role: 'user',
        parts: [
          { type: 'text', text: wire },
          { type: AGENTS_MENTIONS_DATA_TYPE, data: { mentions: [ann] } },
        ],
      },
    ],
  });
  expect(markdown).toContain('## You\n\nEmail Ann Lee today');
});
