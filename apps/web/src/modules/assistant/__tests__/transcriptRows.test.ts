import { describe, expect, it } from 'vite-plus/test';
import { answerMessage, transcriptOf } from '../transcriptRows';

// Entry ids are numbers, as pi stores them.
const member = (id: number, text: string) => ({
  id,
  kind: 'assistant.user',
  data: [{ type: 'text', text }],
});

type Fields = Record<string, unknown>;

const said = (id: number, ...content: Fields[]) => ({
  id,
  kind: 'pi.assistant',
  model: [{ role: 'assistant', content, stopReason: 'stop' }],
});

const call = (id: string, name: string, args: Fields) => ({
  type: 'toolCall',
  id,
  name,
  arguments: args,
});

const result = (toolCallId: string, value: unknown, isError = false) => ({
  id: 100,
  kind: 'pi.toolResult',
  model: [
    {
      role: 'toolResult',
      toolCallId,
      toolName: 'tool',
      content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }],
      isError,
    },
  ],
});

const replyRows = (entries: Fields[], docs: Fields = {}) => {
  const last = transcriptOf({ entries, docs }).messages.at(-1);

  if (last?.role !== 'assistant') throw new Error('no reply');

  return last.rows;
};

const failureOf = (reason: string) =>
  transcriptOf({
    entries: [member(1, 'Hi')],
    docs: { 'pi.live': { runFailure: { taskId: 't', inputs: [], reason, detail: 'Bad key' } } },
  }).failure;

const changedBy = (output: Fields) =>
  transcriptOf({
    entries: [
      member(1, 'Tag Ada'),
      said(2, call('c1', 'callApi', { procedure: 'customers.update' })),
      result('c1', output),
    ],
    docs: {},
  }).changed;

describe('transcriptOf', () => {
  it('groups tool calls into one steps row whose count matches the rows it lists', () => {
    const rows = replyRows([
      member(1, 'Show me deals'),
      said(
        2,
        { type: 'thinking', thinking: 'Look up deals first.' },
        call('c1', 'searchApi', { query: 'deals' }),
      ),
      result('c1', { procedures: [] }),
      said(4, call('c2', 'callApi', { procedure: 'customers.list', input: { limit: 3 } })),
      result('c2', { ok: true, result: { data: [] } }),
      said(5, { type: 'text', text: 'Here they are.' }),
    ]);

    expect(rows.map((row) => row.kind)).toEqual(['thinking', 'steps', 'text']);

    const steps = rows.find((row) => row.kind === 'steps');

    expect(steps?.kind === 'steps' && steps.steps.map((step) => [step.name, step.status])).toEqual([
      ['searchApi', 'done'],
      ['customers.list', 'done'],
    ]);
  });

  it('keeps one reply per run between member messages, and skips pi system entries', () => {
    const { messages } = transcriptOf({
      entries: [
        { id: 0, kind: 'pi.system', model: [{ role: 'system', content: [] }] },
        member(1, 'Hi'),
        said(2, { type: 'text', text: 'Hello.' }),
        member(3, 'Thanks'),
        said(4, { type: 'text', text: 'Any time.' }),
      ],
      docs: {},
    });

    expect(messages.map((message) => [message.role, message.key])).toEqual([
      ['user', '1'],
      ['assistant', 'reply-1'],
      ['user', '3'],
      ['assistant', 'reply-3'],
    ]);
  });

  it('names a loaded skill by the skill, and a program run by what it did', () => {
    const rows = replyRows([
      member(1, 'Automate it'),
      said(
        2,
        call('s1', 'loadSkill', { name: 'author-automation' }),
        call('r1', 'runCode', { code: 'return 1;' }),
      ),
      result('s1', { ok: true, name: 'author-automation', instructions: '…' }),
      result('r1', { ok: false, code: 'TIMEOUT', message: 'The program ran past 10 seconds' }),
    ]);

    expect(rows).toMatchObject([
      {
        kind: 'steps',
        steps: [
          { tool: 'loadSkill', name: 'author-automation', status: 'done' },
          { tool: 'runCode', status: 'failed', error: 'The program ran past 10 seconds' },
        ],
      },
    ]);
  });

  it('marks a step failed when the tool errored or the API refused it', () => {
    const rows = replyRows([
      member(1, 'Clean up tags'),
      said(
        2,
        call('c3', 'callApi', { procedure: 'tags.create', input: {} }),
        call('c4', 'callApi', { procedure: 'tags.remove', input: { id: 'x' } }),
      ),
      result('c3', 'Network down', true),
      result('c4', { ok: false, code: 'NOT_FOUND', message: 'Tag not found' }),
    ]);

    expect(rows).toMatchObject([
      {
        kind: 'steps',
        steps: [
          { name: 'tags.create', status: 'failed', error: 'Network down', output: null },
          { name: 'tags.remove', status: 'failed', error: 'Tag not found' },
        ],
      },
    ]);
  });

  it('shows a call without a result as running, and an artifact as a card', () => {
    const artifact = {
      format: 'csv',
      title: 'Top customers',
      filename: 'Top-customers.csv',
      content: 'Customer\nAda',
    };

    const rows = replyRows([
      member(1, 'Make a table'),
      said(
        2,
        call('c1', 'createArtifact', { title: 'Top customers' }),
        call('c2', 'callApi', { procedure: 'deals.list' }),
      ),
      result('c1', artifact),
    ]);

    expect(rows).toMatchObject([
      { kind: 'artifact', artifact },
      { kind: 'steps', steps: [{ name: 'deals.list', status: 'running' }] },
    ]);
  });

  it('streams the message the model is writing now, after what is committed', () => {
    const live = {
      'pi.live': {
        run: { taskId: 't1', inputs: [], turns: 0 },
        generation: {
          attempt: 1,
          message: {
            role: 'assistant',
            content: [
              { type: 'thinking', thinking: 'Counting.' },
              { type: 'text', text: 'There are' },
            ],
            stopReason: 'pending',
          },
        },
      },
    };

    const view = { entries: [member(1, 'How many?')], docs: live };
    const transcript = transcriptOf(view);

    expect(transcript.running).toBe(true);
    expect(replyRows(view.entries, live)).toMatchObject([
      { kind: 'thinking', text: 'Counting.', streaming: false },
      { kind: 'text', text: 'There are', streaming: true },
    ]);

    expect(transcriptOf({ ...view, docs: {} }).running).toBe(false);
  });

  it('says why the last run ended without an answer, unless the member stopped it', () => {
    expect(failureOf('model_error')).toBe('Bad key');
    expect(failureOf('aborted')).toBeNull();
  });

  it('notices a reply that changed records', () => {
    expect(changedBy({ ok: true, changed: true, result: {} })).toBe(true);
    expect(changedBy({ ok: true, result: {} })).toBe(false);
  });
});

describe('questions the assistant asks', () => {
  const asked = said(
    2,
    call('q2', 'ask_user', {
      questions: [
        { question: 'Which channel?', options: [{ label: 'Email' }, { label: 'SMS' }] },
        { question: 'Anything to add?' },
      ],
    }),
  );

  it('asks the questions of an ask_user call after the latest member message', () => {
    const entries = [member(1, 'Send a campaign'), asked, result('q2', { asked: true })];
    const transcript = transcriptOf({ entries, docs: {} });

    expect(transcript.pending).toBe('question');
    expect(replyRows(entries)).toMatchObject([
      {
        kind: 'question',
        key: 'q2',
        questions: [
          { question: 'Which channel?', options: [{ label: 'Email' }, { label: 'SMS' }] },
          { question: 'Anything to add?', options: [] },
        ],
      },
    ]);
  });

  it('answers with one line per question, and asks no more once answered', () => {
    const text = answerMessage(
      [
        { question: 'Which channel?', options: [] },
        { question: 'Which days?', options: [], selectionMode: 'multi_select' },
      ],
      ['Email', ['Mon', 'Tue']],
    );

    expect(text).toBe('Which channel?: Email\nWhich days?: Mon, Tue');

    const transcript = transcriptOf({
      entries: [
        member(1, 'Send a campaign'),
        asked,
        result('q2', { asked: true }),
        member(3, text),
        said(4, { type: 'text', text: 'Sent.' }),
      ],
      docs: {},
    });

    expect(transcript.pending).toBeNull();
    expect(
      transcript.messages.flatMap((message) => (message.role === 'user' ? [] : message.rows)),
    ).toMatchObject([{ kind: 'text', text: 'Sent.' }]);
  });
});
