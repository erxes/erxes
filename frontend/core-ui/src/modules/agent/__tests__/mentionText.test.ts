import {
  agentMentionPlainText,
  agentMentionsFromText,
  applyAgentMentionEdit,
  findAgentMentionQuery,
  insertAgentMention,
  parseAgentMentionText,
  removeAgentMentionAtCaret,
  sanitizeAgentMentionLabel,
  serializeAgentMentionText,
  type IAgentMention,
  type IAgentMentionRange,
} from '../utils/mentionText';

const ann: IAgentMention = { type: 'customer', id: 'c1', label: 'Ann Lee' };
const acme: IAgentMention = { type: 'company', id: 'co_1', label: 'Acme' };
const range = (start: number, mention: IAgentMention): IAgentMentionRange => ({
  start,
  end: start + mention.label.length + 1,
  mention,
});

describe('serialize / parse', () => {
  it('round-trips visible mentions through wire tokens', () => {
    const value = 'Email @Ann Lee about @Acme.';
    const ranges = [range(6, ann), range(21, acme)];
    const wire = serializeAgentMentionText(value, ranges);
    expect(wire).toBe(
      'Email [[customer:c1:Ann Lee]] about [[company:co_1:Acme]].',
    );
    expect(parseAgentMentionText(wire)).toEqual({ value, mentions: ranges });
  });

  it('ignores ranges whose text no longer matches', () => {
    expect(serializeAgentMentionText('Email @Ann', [range(6, ann)])).toBe(
      'Email @Ann',
    );
  });

  it('keeps page tokens and malformed tokens literal', () => {
    const text = 'Open [[page:L3NhbGVz:Sales]] and [[customer:../x:Bad]]';
    expect(parseAgentMentionText(text)).toEqual({ value: text, mentions: [] });
  });

  it('reads tokens as @labels for copy and lists unique records', () => {
    const text =
      '[[customer:c1:Ann Lee]] and [[customer:c1:Ann Lee]] at [[company:co_1:Acme]]';
    expect(agentMentionPlainText(text)).toBe('@Ann Lee and @Ann Lee at @Acme');
    expect(agentMentionsFromText(text)).toEqual([ann, acme]);
  });

  it('sanitizes labels like the backend', () => {
    expect(sanitizeAgentMentionLabel('  [Ann]\n  Lee ')).toBe('Ann Lee');
    expect(sanitizeAgentMentionLabel('x'.repeat(90))).toHaveLength(80);
  });
});

describe('applyAgentMentionEdit', () => {
  const value = 'Hi @Ann Lee!';
  const ranges = [range(3, ann)];

  it('shifts mentions after an edit before them', () => {
    expect(applyAgentMentionEdit(value, `Oh ${value}`, ranges, 3)).toEqual([
      range(6, ann),
    ]);
  });

  it('keeps mentions before an edit after them', () => {
    expect(applyAgentMentionEdit(value, `${value} ok`, ranges, 15)).toEqual(
      ranges,
    );
  });

  it('drops a mention edited from the inside, even with repeated letters', () => {
    // Typing "n" inside "@Ann" is indistinguishable by diff alone.
    expect(
      applyAgentMentionEdit(
        '@Ann',
        '@Annn',
        [range(0, { ...ann, label: 'Ann' })],
        3,
      ),
    ).toEqual([]);
    expect(applyAgentMentionEdit(value, 'Hi @Ann Le!', ranges, 10)).toEqual([]);
  });

  it('falls back to a plain diff without a caret', () => {
    expect(applyAgentMentionEdit(value, `>> ${value}`, ranges)).toEqual([
      range(6, ann),
    ]);
    expect(applyAgentMentionEdit(value, '', ranges)).toEqual([]);
  });
});

describe('findAgentMentionQuery', () => {
  it('opens on @ at a word boundary and reads the query up to the caret', () => {
    expect(findAgentMentionQuery('Ask @an', 7, [])).toEqual({
      start: 4,
      query: 'an',
    });
    expect(findAgentMentionQuery('@', 1, [])).toEqual({ start: 0, query: '' });
    expect(findAgentMentionQuery('(@ann lee', 9, [])).toEqual({
      start: 1,
      query: 'ann lee',
    });
  });

  it('stays closed for emails, new lines and long phrases', () => {
    expect(findAgentMentionQuery('me@example.com', 14, [])).toBeNull();
    expect(findAgentMentionQuery('@ann\nnext', 9, [])).toBeNull();
    expect(findAgentMentionQuery('@ ann', 5, [])).toBeNull();
    expect(findAgentMentionQuery('@a b c d', 8, [])).toBeNull();
    expect(findAgentMentionQuery(`@${'a'.repeat(41)}`, 42, [])).toBeNull();
  });

  it('never treats an existing mention as a trigger', () => {
    const ranges = [range(0, ann)];
    expect(findAgentMentionQuery('@Ann Lee', 8, ranges)).toBeNull();
    expect(findAgentMentionQuery('@Ann Lee hi', 11, ranges)).toBeNull();
    expect(findAgentMentionQuery('@Ann Lee @ac', 12, ranges)).toEqual({
      start: 9,
      query: 'ac',
    });
  });
});

describe('insert / remove', () => {
  it('replaces the query with the mention and one space', () => {
    const value = 'Ask @an,@Acme';
    const result = insertAgentMention(
      value,
      [range(8, acme)],
      { start: 4, query: 'an' },
      7,
      ann,
    );
    expect(result.value).toBe('Ask @Ann Lee ,@Acme');
    expect(result.caret).toBe(13);
    expect(serializeAgentMentionText(result.value, result.mentions)).toBe(
      'Ask [[customer:c1:Ann Lee]] ,[[company:co_1:Acme]]',
    );
  });

  it('reuses a following space', () => {
    const result = insertAgentMention(
      '@an today',
      [],
      { start: 0, query: 'an' },
      3,
      ann,
    );
    expect(result).toEqual({
      value: '@Ann Lee today',
      mentions: [range(0, ann)],
      caret: 9,
    });
  });

  it('removes a whole mention with Backspace at its end or Delete at its start', () => {
    const value = 'Hi @Ann Lee and @Acme';
    const ranges = [range(3, ann), range(16, acme)];
    expect(removeAgentMentionAtCaret(value, ranges, 11, 'Backspace')).toEqual({
      value: 'Hi  and @Acme',
      mentions: [range(8, acme)],
      caret: 3,
    });
    expect(removeAgentMentionAtCaret(value, ranges, 16, 'Delete')?.value).toBe(
      'Hi @Ann Lee and ',
    );
    expect(removeAgentMentionAtCaret(value, ranges, 3, 'Backspace')).toBeNull();
    expect(
      removeAgentMentionAtCaret(value, ranges, 12, 'Backspace'),
    ).toBeNull();
  });
});
