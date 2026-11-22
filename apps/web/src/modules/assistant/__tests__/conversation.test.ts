import { describe, expect, it } from 'vite-plus/test';
import { threadMarkdown } from '../exportMarkdown';
import { modelToRun, sendRequest } from '../modelChoice';
import { transcriptOf } from '../transcriptRows';

describe('sendRequest', () => {
  it('sends the message with the thread and the model that will run', () => {
    const body = sendRequest({
      threadId: 'thread-1',
      parts: [{ type: 'text', text: 'Second' }],
      run: { provider: 'kimi', model: 'kimi-k3', thinkingLevel: 'low' },
    });

    expect(body).toEqual({
      threadId: 'thread-1',
      message: { parts: [{ type: 'text', text: 'Second' }] },
      provider: 'kimi',
      model: 'kimi-k3',
      thinkingLevel: 'low',
    });
  });

  it('leaves out what is not chosen yet, so the server uses its defaults', () => {
    expect(
      sendRequest({ threadId: null, parts: [{ type: 'text', text: 'Hi' }], run: null }),
    ).toEqual({ message: { parts: [{ type: 'text', text: 'Hi' }] } });
  });
});

describe('modelToRun', () => {
  const connections = [
    { provider: 'openai' as const, isDefault: false },
    { provider: 'kimi' as const, isDefault: true },
  ];

  const catalog = [
    {
      provider: 'openai' as const,
      error: null,
      models: [
        { id: 'gpt-a', name: 'GPT A', recommended: true, thinking: null },
        { id: 'gpt-b', name: null, recommended: false, thinking: null },
      ],
    },
    {
      provider: 'kimi' as const,
      error: null,
      models: [
        { id: 'kimi-old', name: null, recommended: false, thinking: null },
        {
          id: 'kimi-k3',
          name: 'Kimi K3',
          recommended: true,
          thinking: { kind: 'effort' as const, levels: ['off' as const, 'low' as const] },
        },
      ],
    },
  ];

  it('names the default provider and its best model when nothing is picked', () => {
    expect(modelToRun({ connections, catalog, picked: {} })).toMatchObject({
      provider: 'kimi',
      model: 'kimi-k3',
      label: 'Kimi K3',
    });
  });

  it('runs the picked model, and thinking only where the model supports it', () => {
    expect(
      modelToRun({
        connections,
        catalog,
        picked: { provider: 'openai', model: 'gpt-b', thinkingLevel: 'low' },
      }),
    ).toMatchObject({
      provider: 'openai',
      model: 'gpt-b',
      label: 'gpt-b',
      thinkingLevel: undefined,
    });

    expect(
      modelToRun({ connections, catalog, picked: { provider: 'kimi', thinkingLevel: 'low' } }),
    ).toMatchObject({ model: 'kimi-k3', thinkingLevel: 'low' });
  });

  it('names the thinking level that will run when none is picked or the pick is not offered', () => {
    const effortOnly = [
      {
        provider: 'kimi' as const,
        error: null,
        models: [
          {
            id: 'kimi-k3',
            name: 'Kimi K3',
            recommended: true,
            thinking: {
              kind: 'effort' as const,
              levels: ['low' as const, 'high' as const, 'max' as const],
            },
          },
        ],
      },
    ];

    expect(modelToRun({ connections, catalog, picked: {} })).toMatchObject({
      thinkingLevel: 'off',
    });

    expect(modelToRun({ connections, catalog: effortOnly, picked: {} })).toMatchObject({
      thinkingLevel: 'low',
    });

    expect(
      modelToRun({ connections, catalog: effortOnly, picked: { thinkingLevel: 'medium' } }),
    ).toMatchObject({ thinkingLevel: 'high' });
  });

  it('falls back to the default provider when the picked one has no key any more', () => {
    expect(
      modelToRun({
        connections: [{ provider: 'kimi', isDefault: true }],
        catalog,
        picked: { provider: 'openai', model: 'gpt-a' },
      }),
    ).toMatchObject({ provider: 'kimi', model: 'kimi-k3' });
  });

  it('is null without any saved key', () => {
    expect(modelToRun({ connections: [], catalog: [], picked: {} })).toBeNull();
  });
});

type Fields = Record<string, unknown>;

// Entry ids are numbers, as pi stores them.
const member = (id: number, ...parts: Fields[]) => ({ id, kind: 'assistant.user', data: parts });

const said = (id: number, ...content: Fields[]) => ({
  id,
  kind: 'pi.assistant',
  model: [{ role: 'assistant', content, stopReason: 'stop' }],
});

const call = (id: string, name: string, args: Fields = {}) => ({
  type: 'toolCall',
  id,
  name,
  arguments: args,
});

const result = (toolCallId: string, value: Fields) => ({
  id: 100,
  kind: 'pi.toolResult',
  model: [
    {
      role: 'toolResult',
      toolCallId,
      toolName: 'tool',
      content: [{ type: 'text', text: JSON.stringify(value) }],
      isError: false,
    },
  ],
});

const exported = (title: string, entries: Fields[]) =>
  threadMarkdown(title, transcriptOf({ entries, docs: {} }).messages, 'https://acme.erxes.io');

describe('threadMarkdown', () => {
  it('writes the conversation as Markdown, with interface blocks named and without tool calls', () => {
    const markdown = exported('Top customers', [
      member(1, { type: 'text', text: 'Who are our top customers?' }),
      said(2, {
        type: 'text',
        text: 'Which period?\n\n<a2ui>\nsurface("period")\nroot = Text("x")\n</a2ui>',
      }),
      member(3, { type: 'text', text: 'This quarter' }),
      said(4, call('c', 'callApi', { procedure: 'customers.list', input: {} })),
      result('c', { ok: true }),
      said(5, { type: 'text', text: '| Name |\n| --- |\n| Ada |' }),
    ]);

    expect(markdown).toBe(
      [
        '# Top customers',
        '',
        '## You',
        '',
        'Who are our top customers?',
        '',
        '## Assistant',
        '',
        'Which period?\n\n_(interactive view)_',
        '',
        '## You',
        '',
        'This quarter',
        '',
        '## Assistant',
        '',
        '| Name |\n| --- |\n| Ada |',
        '',
      ].join('\n'),
    );
  });

  it('lists attachments as links and writes each artifact into the export', () => {
    const markdown = exported('Q3 review', [
      member(
        1,
        { type: 'text', text: 'Compare with this quote' },
        {
          type: 'data-files',
          data: {
            files: [{ id: 'f1', name: 'quote.pdf', contentType: 'application/pdf', size: 125_000 }],
          },
        },
      ),
      said(2, call('c1', 'createArtifact'), call('c2', 'createArtifact')),
      result('c1', {
        format: 'csv',
        title: 'Top customers',
        filename: 'Top-customers.csv',
        content: 'Customer,Deals\n"Altai, LLC",3',
      }),
      result('c2', {
        format: 'html',
        title: 'Sales report',
        filename: 'Sales-report.html',
        content: '<p class="scope">Q3</p>',
      }),
      said(4, { type: 'text', text: 'Here they are.' }),
    ]);

    expect(markdown).toContain(
      '- [quote.pdf](https://acme.erxes.io/core/v1/files/f1/download) (PDF · 122 KB)',
    );
    expect(markdown).toContain(
      '### Top customers\n\n| Customer | Deals |\n| --- | --- |\n| Altai, LLC | 3 |',
    );
    expect(markdown).toContain('### Sales report\n\n```html\n<p class="scope">Q3</p>\n```');
    expect(markdown.indexOf('### Sales report')).toBeLessThan(markdown.indexOf('Here they are.'));
  });
});
