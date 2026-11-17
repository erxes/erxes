import type { UIMessage } from 'ai';
import { describe, expect, it } from 'vite-plus/test';
import { pendingAction, transcriptRows } from '../transcriptRows';

type Parts = UIMessage['parts'];

const search: Parts[number] = {
  type: 'tool-searchApi',
  toolCallId: 'c1',
  state: 'output-available',
  input: { query: 'deals' },
  output: { procedures: [] },
};

const list: Parts[number] = {
  type: 'tool-callApi',
  toolCallId: 'c2',
  state: 'output-available',
  input: { procedure: 'customers.list', input: { limit: 3 } },
  output: { ok: true, result: { data: [] } },
};

describe('transcriptRows', () => {
  it('groups tool calls into one steps row whose count matches the rows it lists', () => {
    const rows = transcriptRows([
      { type: 'step-start' },
      { type: 'reasoning', text: 'Look up deals first.', state: 'done' },
      search,
      { type: 'step-start' },
      list,
      { type: 'step-start' },
      { type: 'text', text: 'Here they are.', state: 'done' },
    ]);

    expect(rows.map((row) => row.kind)).toEqual(['thinking', 'steps', 'text']);

    const steps = rows.find((row) => row.kind === 'steps');

    expect(steps?.kind === 'steps' && steps.steps.map((step) => [step.name, step.status])).toEqual([
      ['searchApi', 'done'],
      ['customers.list', 'done'],
    ]);
  });

  it('draws an answered question where it was asked, before the steps that followed', () => {
    const rows = transcriptRows([
      {
        type: 'tool-ask_user',
        toolCallId: 'q1',
        state: 'output-available',
        input: { questions: [{ question: 'Which channel?', options: [{ label: 'Email' }] }] },
        output: { answers: ['Email'] },
      },
      { type: 'step-start' },
      list,
      { type: 'text', text: 'Done.', state: 'done' },
    ]);

    expect(rows.map((row) => row.kind)).toEqual(['answered', 'steps', 'text']);
    expect(rows[0]).toMatchObject({
      kind: 'answered',
      answers: [{ question: 'Which channel?', answer: 'Email' }],
    });
  });

  it('names a loaded skill by the skill, and a program run by what it did', () => {
    const rows = transcriptRows([
      {
        type: 'tool-loadSkill',
        toolCallId: 's1',
        state: 'output-available',
        input: { name: 'author-automation' },
        output: { ok: true, name: 'author-automation', instructions: '…' },
      },
      {
        type: 'tool-runCode',
        toolCallId: 'r1',
        state: 'output-available',
        input: { code: 'return 1;' },
        output: { ok: false, code: 'TIMEOUT', message: 'The program ran past 10 seconds' },
      },
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
    const rows = transcriptRows([
      {
        type: 'tool-callApi',
        toolCallId: 'c3',
        state: 'output-error',
        input: { procedure: 'tags.create', input: {} },
        errorText: 'Network down',
      },
      {
        type: 'tool-callApi',
        toolCallId: 'c4',
        state: 'output-available',
        input: { procedure: 'tags.remove', input: { id: 'x' } },
        output: { ok: false, code: 'NOT_FOUND', message: 'Tag not found' },
      },
    ]);

    expect(rows).toMatchObject([
      {
        kind: 'steps',
        steps: [
          { name: 'tags.create', status: 'failed', error: 'Network down' },
          { name: 'tags.remove', status: 'failed', error: 'Tag not found' },
        ],
      },
    ]);
  });

  it('turns a pending approval into an approval card and a declined one into a declined step', () => {
    const rows = transcriptRows([
      {
        type: 'tool-callApi',
        toolCallId: 'c5',
        state: 'output-denied',
        input: { procedure: 'customers.remove', input: { id: 'a' } },
        approval: { id: 'a0', approved: false },
      },
      {
        type: 'tool-callApi',
        toolCallId: 'c6',
        state: 'approval-requested',
        input: { procedure: 'customers.create', input: { firstName: 'Ada' } },
        approval: { id: 'a1' },
      },
    ]);

    expect(rows).toMatchObject([
      { kind: 'steps', steps: [{ name: 'customers.remove', status: 'declined' }] },
      {
        kind: 'approval',
        approvalId: 'a1',
        procedure: 'customers.create',
        input: { firstName: 'Ada' },
      },
    ]);
  });

  it('asks the questions of an unanswered ask_user call', () => {
    const rows = transcriptRows([
      {
        type: 'tool-ask_user',
        toolCallId: 'q2',
        state: 'input-available',
        input: {
          questions: [
            { question: 'Which channel?', options: [{ label: 'Email' }, { label: 'SMS' }] },
            { question: 'Anything to add?' },
          ],
        },
      },
    ]);

    expect(rows).toMatchObject([
      {
        kind: 'question',
        toolCallId: 'q2',
        questions: [
          { question: 'Which channel?', options: [{ label: 'Email' }, { label: 'SMS' }] },
          { question: 'Anything to add?', options: [] },
        ],
      },
    ]);
  });
});

const assistant = (parts: Parts): UIMessage => ({ id: 'm', role: 'assistant', parts });

describe('pendingAction', () => {
  it('says what the member must do before the reply can go on', () => {
    expect(
      pendingAction(
        assistant([
          {
            type: 'tool-callApi',
            toolCallId: 'c',
            state: 'approval-requested',
            input: { procedure: 'tags.create', input: {} },
            approval: { id: 'a' },
          },
        ]),
      ),
    ).toBe('approval');

    expect(
      pendingAction(
        assistant([
          {
            type: 'tool-ask_user',
            toolCallId: 'q',
            state: 'input-available',
            input: { questions: [{ question: 'Why?' }] },
          },
        ]),
      ),
    ).toBe('question');

    expect(pendingAction(assistant([search, { type: 'text', text: 'Ok', state: 'done' }]))).toBe(
      null,
    );
  });

  it('waits until every approval in the reply is answered', () => {
    const answered = {
      type: 'tool-callApi',
      toolCallId: 'c7',
      state: 'approval-responded',
      input: { procedure: 'tags.create', input: {} },
      approval: { id: 'a7', approved: true },
    } as const;

    const waiting = {
      type: 'tool-callApi',
      toolCallId: 'c8',
      state: 'approval-requested',
      input: { procedure: 'tags.create', input: {} },
      approval: { id: 'a8' },
    } as const;

    expect(pendingAction(assistant([answered, waiting]))).toBe('approval');
    expect(pendingAction(assistant([answered]))).toBeNull();
  });
});
