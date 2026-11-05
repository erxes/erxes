import { maskAgentReferences } from '../references/maskAgentReferences';

describe('maskAgentReferences', () => {
  it('masks a valid token and preserves the label verbatim', () => {
    const { text, references } = maskAgentReferences(
      'Top deal: [[deal:abc:Big *Order* _x_]] here',
    );

    expect(text).toBe('Top deal: AGENTREF0XREF here');
    expect(references).toEqual([
      { type: 'deal', id: 'abc', label: 'Big *Order* _x_' },
    ]);
  });

  it('masks a label made only of underscores', () => {
    const { text, references } = maskAgentReferences('see [[user:u1:_name_]]');

    expect(text).toBe('see AGENTREF0XREF');
    expect(references[0]).toEqual({ type: 'user', id: 'u1', label: '_name_' });
  });

  it('leaves a token inside an inline code span literal', () => {
    const input = 'run `[[deal:abc:Big Order]]` then [[deal:d2:Two]]';
    const { text, references } = maskAgentReferences(input);

    expect(text).toBe('run `[[deal:abc:Big Order]]` then AGENTREF0XREF');
    expect(references).toHaveLength(1);
    expect(references[0].id).toBe('d2');
  });

  it('leaves a token inside a fenced code block literal', () => {
    const input = [
      'before [[deal:a:One]]',
      '```text',
      '[[deal:b:Two]]',
      '```',
      'after [[deal:c:Three]]',
    ].join('\n');
    const { text, references } = maskAgentReferences(input);

    expect(text).toBe(
      [
        'before AGENTREF0XREF',
        '```text',
        '[[deal:b:Two]]',
        '```',
        'after AGENTREF1XREF',
      ].join('\n'),
    );
    expect(references.map((ref) => ref.id)).toEqual(['a', 'c']);
  });

  it('supports tilde fences', () => {
    const input = '~~~\n[[deal:a:X]]\n~~~\n[[deal:b:Y]]';
    const { text, references } = maskAgentReferences(input);

    expect(text).toBe('~~~\n[[deal:a:X]]\n~~~\nAGENTREF0XREF');
    expect(references).toHaveLength(1);
  });

  it('masks multiple tokens in one paragraph in order', () => {
    const { text, references } = maskAgentReferences(
      '[[deal:a:One]] and [[customer:b:Two]] and [[deal:c:Three]]',
    );

    expect(text).toBe('AGENTREF0XREF and AGENTREF1XREF and AGENTREF2XREF');
    expect(references.map((ref) => ref.label)).toEqual([
      'One',
      'Two',
      'Three',
    ]);
  });

  it('masks a token inside a table cell line', () => {
    const { text } = maskAgentReferences(
      '| Deal | Status |\n| --- | --- |\n| [[deal:d9:Nine]] | open |',
    );

    expect(text).toContain('| AGENTREF0XREF | open |');
  });

  it('leaves malformed and unknown-type tokens literal', () => {
    const input = '[[widget:x:Y]] [[deal::no id]] [[deal:x]]';
    const { text, references } = maskAgentReferences(input);

    expect(text).toBe(input);
    expect(references).toEqual([]);
  });

  it('keeps an unclosed token literal', () => {
    expect(maskAgentReferences('mid [[deal:ab').text).toBe('mid [[deal:ab');
  });

  it('falls back to the id when the label is whitespace', () => {
    const { references } = maskAgentReferences('[[deal:x:  ]]');

    expect(references).toEqual([]);
  });

  it('keeps text after an unclosed backtick run maskable', () => {
    const { text } = maskAgentReferences('a `tick [[deal:x:One]] done');

    // ` opens a code span that never closes — CommonMark renders the
    // backtick literal, so the token after it still masks.
    expect(text).toBe('a `tick AGENTREF0XREF done');
  });
});
