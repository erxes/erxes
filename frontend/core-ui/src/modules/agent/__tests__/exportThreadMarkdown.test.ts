import type { UIMessage } from 'ai';

import {
  buildThreadMarkdown,
  slugifyThreadTitle,
} from '../utils/exportThreadMarkdown';

const textPart = (text: string): UIMessage['parts'][number] => ({
  type: 'text',
  text,
});

const message = (
  role: 'user' | 'assistant',
  parts: UIMessage['parts'],
  metadata?: unknown,
): UIMessage => ({ id: `${role}-x`, role, parts, metadata }) as UIMessage;

const exportedAt = new Date('2026-10-20T12:00:00.000Z');

describe('buildThreadMarkdown', () => {
  it('renders user and assistant text under You / AI Agent headings', () => {
    const markdown = buildThreadMarkdown({
      title: 'Deal summary',
      exportedAt,
      messages: [
        message('user', [textPart('Summarize my deals')]),
        message('assistant', [textPart('You have **3** open deals.')]),
      ],
    });

    expect(markdown).toContain('# Deal summary');
    expect(markdown).toContain('_Exported 2026-10-20T12:00:00.000Z_');
    expect(markdown).toContain('## You\n\nSummarize my deals');
    expect(markdown).toContain('## AI Agent\n\nYou have **3** open deals.');
  });

  it('strips a persisted [Page context] prefix from user turns', () => {
    const markdown = buildThreadMarkdown({
      title: 'T',
      exportedAt,
      messages: [
        message('user', [
          textPart('[Page context] The user is viewing /contacts/customers.'),
          textPart('Show me this customer'),
        ]),
      ],
    });

    expect(markdown).not.toContain('[Page context]');
    expect(markdown).toContain('Show me this customer');
  });

  it('skips ask_user answer turns marked metadata.agentsAnswer', () => {
    const markdown = buildThreadMarkdown({
      title: 'T',
      exportedAt,
      messages: [
        message('user', [textPart('real question')]),
        message('user', [textPart('Picked: blue')], {
          agentsAnswer: true,
        }),
      ],
    });

    expect(markdown).toContain('real question');
    expect(markdown).not.toContain('Picked: blue');
  });

  it('rewrites valid references to their label but keeps code literal', () => {
    const markdown = buildThreadMarkdown({
      title: 'T',
      exportedAt,
      messages: [
        message('assistant', [
          textPart(
            'Found [[customer:cust1:agent-smoke Customer]]. Literal: `[[customer:cust1:not this]]`\n\n```\n[[deal:d1:still literal]]\n```',
          ),
        ]),
      ],
    });

    expect(markdown).toContain('Found agent-smoke Customer.');
    expect(markdown).toContain('`[[customer:cust1:not this]]`');
    expect(markdown).toContain('[[deal:d1:still literal]]');
    expect(markdown).not.toContain('cust1:agent-smoke');
  });

  it('skips reasoning and tool parts', () => {
    const markdown = buildThreadMarkdown({
      title: 'T',
      exportedAt,
      messages: [
        message('assistant', [
          { type: 'reasoning', text: 'hmm' } as UIMessage['parts'][number],
          {
            type: 'tool-callTool',
            toolCallId: 'x',
            state: 'output-available',
            input: {},
            output: {},
          } as UIMessage['parts'][number],
          textPart('visible answer'),
        ]),
      ],
    });

    expect(markdown).toContain('visible answer');
    expect(markdown).not.toContain('hmm');
  });
});

describe('slugifyThreadTitle', () => {
  it('slugifies titles and falls back via caller when empty', () => {
    expect(slugifyThreadTitle('My Great Thread!')).toBe('my-great-thread');
    expect(slugifyThreadTitle('  a--b  ')).toBe('a-b');
    expect(slugifyThreadTitle("what's up")).toBe('whats-up');
    expect(slugifyThreadTitle('!!!')).toBe('');
  });
});
