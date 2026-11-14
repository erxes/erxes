import type { UIMessage } from 'ai';
import { describe, expect, it } from 'vite-plus/test';
import { chatRequestBody } from '../chatRequest';
import { threadMarkdown } from '../exportMarkdown';
import { modelToRun } from '../modelChoice';

const user = (id: string, text: string): UIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

describe('chatRequestBody', () => {
  it('sends only the newest message with the thread and the model that will run', () => {
    const body = chatRequestBody({
      messages: [user('u1', 'First'), user('u2', 'Second')],
      threadId: 'thread-1',
      run: { provider: 'kimi', model: 'kimi-k3', thinkingLevel: 'low' },
    });

    expect(body).toEqual({
      threadId: 'thread-1',
      message: { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'Second' }] },
      provider: 'kimi',
      model: 'kimi-k3',
      thinkingLevel: 'low',
    });
  });

  it('leaves out what is not chosen yet, so the server uses its defaults', () => {
    expect(chatRequestBody({ messages: [user('u1', 'Hi')], run: null })).toEqual({
      message: { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
    });
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

describe('threadMarkdown', () => {
  it('writes the conversation as Markdown, with answered questions and without tool calls', () => {
    const markdown = threadMarkdown('Top customers', [
      user('u1', 'Who are our top customers?'),
      {
        id: 'a1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-ask_user',
            toolCallId: 'q',
            state: 'output-available',
            input: { questions: [{ question: 'Which period?' }] },
            output: { answers: ['This quarter'] },
          },
          {
            type: 'tool-callApi',
            toolCallId: 'c',
            state: 'output-available',
            input: { procedure: 'customers.list', input: {} },
            output: { ok: true },
          },
          { type: 'text', text: '| Name |\n| --- |\n| Ada |', state: 'done' },
        ],
      },
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
        '> Which period?',
        '> This quarter',
        '',
        '| Name |\n| --- |\n| Ada |',
        '',
      ].join('\n'),
    );
  });
});
