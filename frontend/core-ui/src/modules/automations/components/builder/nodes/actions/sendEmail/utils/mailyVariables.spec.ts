import {
  editorVariables,
  outputVariableNode,
  readText,
  withVariables,
  writtenVariables,
} from './mailyVariables';

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hi' },
        { type: 'variable', attrs: { id: '{{ trigger.name }}' } },
        { type: 'variable', attrs: { id: 'firstName' } },
      ],
    },
  ],
};

describe('mailyVariables', () => {
  it('lists only output variables written into the email', () => {
    expect(writtenVariables(doc)).toEqual([
      { name: '{{ trigger.name }}', label: 'trigger.name', required: false },
    ]);
  });

  it('reads the email as plain text with variables as tokens', () => {
    expect(readText(doc)).toBe('Hi {{{ trigger.name }}} {firstName}');
  });

  it('adds a variable once', () => {
    const first = { name: 'a', label: 'A', required: false };

    expect(withVariables([first], [first, { ...first, name: 'b' }])).toEqual([
      first,
      { ...first, name: 'b' },
    ]);
  });

  it('prefers a label added while editing over the written token', () => {
    const added = {
      name: '{{ trigger.name }}',
      label: 'Deal name',
      required: false,
    };

    expect(editorVariables(doc, [added])).toEqual([added]);
  });

  it('builds a field node that is never required', () => {
    expect(outputVariableNode('{{ x }}', 'X').attrs).toEqual({
      id: '{{ x }}',
      label: 'X',
      fallback: null,
      required: false,
    });
  });
});
