import type { UIMessage } from 'ai';

import { buildTranscriptRows } from '../utils/transcriptRows';

const textPart = (text: string): UIMessage['parts'][number] => ({
  type: 'text',
  text,
});

const userMessage = (id: string, text = 'question'): UIMessage => ({
  id,
  role: 'user',
  parts: [textPart(text)],
});

const assistantMessage = (id: string, ...texts: string[]): UIMessage => ({
  id,
  role: 'assistant',
  parts: texts.map(textPart),
});

const noHiddenTurns = () => false;

const hideMarkedUserTurns = (message: UIMessage): boolean =>
  message.role === 'user' &&
  message.parts.some(
    (part) => part.type === 'text' && part.text === '__hidden__',
  );

describe('buildTranscriptRows', () => {
  it('merges consecutive assistant messages into one row', () => {
    const messages = [
      assistantMessage('a1', 'one'),
      assistantMessage('a2', 'two'),
    ];

    const rows = buildTranscriptRows(messages, noHiddenTurns);

    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe('a1');
    expect(rows[0].message.id).toBe('a1');
    expect(rows[0].message.parts).toEqual([
      ...messages[0].parts,
      ...messages[1].parts,
    ]);
    expect(rows[0].lastIndex).toBe(1);
    expect(rows[0].previousMessage).toBeUndefined();
  });

  it('merges assistant messages separated only by a hidden user turn', () => {
    const messages = [
      assistantMessage('a1', 'one'),
      userMessage('u-hidden', '__hidden__'),
      assistantMessage('a2', 'two'),
    ];

    const rows = buildTranscriptRows(messages, hideMarkedUserTurns);

    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe('a1');
    expect(rows[0].message.parts).toEqual([
      ...messages[0].parts,
      ...messages[2].parts,
    ]);
    expect(rows[0].lastIndex).toBe(2);
  });

  it('splits around a visible user message', () => {
    const messages = [
      assistantMessage('a1', 'one'),
      userMessage('u1'),
      assistantMessage('a2', 'two'),
    ];

    const rows = buildTranscriptRows(messages, hideMarkedUserTurns);

    expect(rows).toHaveLength(3);
    expect(rows[0].message).toBe(messages[0]);
    expect(rows[1].message).toBe(messages[1]);
    expect(rows[1].key).toBe('u1');
    expect(rows[1].lastIndex).toBe(1);
    expect(rows[2].message).toBe(messages[2]);
    expect(rows[2].previousMessage).toBe(messages[1]);
  });

  it('keeps original identity for single-message rows and never mutates inputs', () => {
    const first = assistantMessage('a1', 'one');
    const second = assistantMessage('a2', 'two');
    const firstParts = first.parts;
    const secondParts = second.parts;

    const rows = buildTranscriptRows(
      [first, userMessage('u1'), second],
      noHiddenTurns,
    );

    expect(rows[0].message).toBe(first);
    expect(rows[2].message).toBe(second);

    const merged = buildTranscriptRows([first, second], noHiddenTurns);

    expect(merged[0].message).not.toBe(first);
    expect(first.parts).toBe(firstParts);
    expect(first.parts).toHaveLength(1);
    expect(second.parts).toBe(secondParts);
    expect(second.parts).toHaveLength(1);
  });

  it('produces no row for a hidden trailing user message', () => {
    const messages = [
      assistantMessage('a1', 'one'),
      userMessage('u-hidden', '__hidden__'),
    ];

    const rows = buildTranscriptRows(messages, hideMarkedUserTurns);

    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe('a1');
    expect(rows[0].lastIndex).toBe(0);
  });
});
