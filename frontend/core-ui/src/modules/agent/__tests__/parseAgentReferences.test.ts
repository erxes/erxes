import { parseAgentReferences } from '../references/parseAgentReferences';

describe('parseAgentReferences', () => {
  it('parses a complete token into a reference segment', () => {
    expect(parseAgentReferences('Top deal is [[deal:abc:Big Order]]')).toEqual(
      [
        { kind: 'text', text: 'Top deal is ' },
        {
          kind: 'reference',
          reference: { type: 'deal', id: 'abc', label: 'Big Order' },
          raw: '[[deal:abc:Big Order]]',
        },
      ],
    );
  });

  it('keeps labels containing colons', () => {
    expect(
      parseAgentReferences('see [[product:p1:Item: Deluxe Edition]]'),
    ).toEqual([
      { kind: 'text', text: 'see ' },
      {
        kind: 'reference',
        reference: { type: 'product', id: 'p1', label: 'Item: Deluxe Edition' },
        raw: '[[product:p1:Item: Deluxe Edition]]',
      },
    ]);
  });

  it('parses every supported type', () => {
    for (const type of [
      'customer',
      'company',
      'user',
      'product',
      'branch',
      'department',
      'unit',
      'brand',
      'deal',
      'conversation',
    ]) {
      const segments = parseAgentReferences(`[[${type}:id-1:Label]]`);
      expect(segments).toEqual([
        {
          kind: 'reference',
          reference: { type, id: 'id-1', label: 'Label' },
          raw: `[[${type}:id-1:Label]]`,
        },
      ]);
    }
  });

  it('deduplicates nothing but handles adjacent tokens', () => {
    expect(
      parseAgentReferences('[[deal:a:X]] and [[customer:b:Y]]'),
    ).toEqual([
      {
        kind: 'reference',
        reference: { type: 'deal', id: 'a', label: 'X' },
        raw: '[[deal:a:X]]',
      },
      { kind: 'text', text: ' and ' },
      {
        kind: 'reference',
        reference: { type: 'customer', id: 'b', label: 'Y' },
        raw: '[[customer:b:Y]]',
      },
    ]);
  });

  it('leaves an unknown type literal', () => {
    expect(parseAgentReferences('a [[widget:abc:Thing]] b')).toEqual([
      { kind: 'text', text: 'a [[widget:abc:Thing]] b' },
    ]);
  });

  it('leaves a malformed token literal', () => {
    expect(parseAgentReferences('a [[deal::no id]] b')).toEqual([
      { kind: 'text', text: 'a [[deal::no id]] b' },
    ]);
    expect(parseAgentReferences('a [[deal:x]] b')).toEqual([
      { kind: 'text', text: 'a [[deal:x]] b' },
    ]);
  });

  it('rejects ids that do not match the id grammar', () => {
    expect(parseAgentReferences('[[deal:a.b:Label]]')).toEqual([
      { kind: 'text', text: '[[deal:a.b:Label]]' },
    ]);
    expect(
      parseAgentReferences(`[[deal:${'a'.repeat(65)}:Label]]`),
    ).toEqual([{ kind: 'text', text: `[[deal:${'a'.repeat(65)}:Label]]` }]);
  });

  it('rejects labels containing brackets or newlines', () => {
    expect(parseAgentReferences('[[deal:x:bad]label]]')).toEqual([
      { kind: 'text', text: '[[deal:x:bad]label]]' },
    ]);
    expect(parseAgentReferences('[[deal:x:bad\nlabel]]')).toEqual([
      { kind: 'text', text: '[[deal:x:bad\nlabel]]' },
    ]);
  });

  it('keeps an unclosed trailing token as literal text mid-stream', () => {
    expect(parseAgentReferences('Working on [[deal:ab')).toEqual([
      { kind: 'text', text: 'Working on [[deal:ab' },
    ]);
  });

  it('parses a token that follows an unclosed one', () => {
    expect(parseAgentReferences('[[oops [[deal:ok:Fine]]')).toEqual([
      { kind: 'text', text: '[[oops ' },
      {
        kind: 'reference',
        reference: { type: 'deal', id: 'ok', label: 'Fine' },
        raw: '[[deal:ok:Fine]]',
      },
    ]);
  });

  it('returns a single text segment when there are no tokens', () => {
    expect(parseAgentReferences('plain text')).toEqual([
      { kind: 'text', text: 'plain text' },
    ]);
    expect(parseAgentReferences('')).toEqual([]);
  });
});
