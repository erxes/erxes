import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { UIMessage } from 'ai';

import {
  agentStepLabel,
  agentMessageActivity,
  describeToolCall,
  isStandalonePart,
  isWorkPart,
  toAgentWorkStep,
} from '../utils/agentWorkSteps';
import type { TAgentWorkStep } from '../utils/agentWorkSteps';

const textPart = (text: string): UIMessage['parts'][number] => ({
  type: 'text',
  text,
});

const reasoningPart = (text: string): UIMessage['parts'][number] => ({
  type: 'reasoning',
  text,
});

const toolPart = (
  toolName: string,
  state: string,
  input?: unknown,
  output?: unknown,
): UIMessage['parts'][number] => {
  const base = {
    type: 'dynamic-tool',
    toolName,
    toolCallId: `call-${toolName}-${state}`,
  } as UIMessage['parts'][number] & { state: string };

  base.state = state;
  if (input !== undefined) {
    (base as { input?: unknown }).input = input;
  }
  if (output !== undefined) {
    (base as { output?: unknown }).output = output;
  }

  return base;
};

describe('work part predicates', () => {
  it('treats reasoning and ordinary tool parts as work', () => {
    expect(isWorkPart(reasoningPart('thinking'))).toBe(true);
    expect(
      isWorkPart(
        toolPart('callTool', 'output-available', {
          toolId: 'sales.trpc.deal.find',
        }),
      ),
    ).toBe(true);
    expect(isWorkPart(textPart('done'))).toBe(false);
    expect(isWorkPart({ type: 'step-start' })).toBe(false);
  });

  it('keeps approval, ask_user and artifact parts standalone', () => {
    const approval = toolPart('callTool', 'approval-requested', {
      toolId: 'x.trpc.a.b',
    });

    expect(isStandalonePart(approval)).toBe(true);
    expect(isStandalonePart(toolPart('callTool', 'output-denied'))).toBe(true);
    expect(isStandalonePart(toolPart('callTool', 'approval-responded'))).toBe(
      true,
    );
    expect(
      isStandalonePart(toolPart('askUser', 'output-available', {}, {})),
    ).toBe(true);
    expect(
      isStandalonePart(toolPart('createArtifact', 'input-streaming')),
    ).toBe(true);
    expect(isWorkPart(approval)).toBe(false);
  });

  it('normalizes work parts into timeline steps', () => {
    expect(toAgentWorkStep(reasoningPart('plan'))).toEqual({
      kind: 'reasoning',
      text: 'plan',
    });
    expect(
      toAgentWorkStep(
        toolPart('readFile', 'output-available', { url: '/a.pdf' }, 'ok'),
      ),
    ).toEqual({
      kind: 'tool',
      tool: expect.objectContaining({
        toolCallId: 'call-readFile-output-available',
        toolName: 'readFile',
        state: 'output-available',
        input: { url: '/a.pdf' },
        output: 'ok',
      }),
    });
    expect(toAgentWorkStep(textPart('answer'))).toBeNull();
    expect(toAgentWorkStep(toolPart('askUser', 'input-available'))).toBeNull();
  });
});

describe('agentStepLabel', () => {
  const tool = (
    toolName: string,
    input?: unknown,
    state = 'output-available',
  ): TAgentWorkStep => ({
    kind: 'tool',
    tool: { toolCallId: 'c1', toolName, state, input },
  });

  it('labels reasoning', () => {
    expect(agentStepLabel({ kind: 'reasoning', text: 'x' })).toBe('Thought');
  });

  it('labels searchTools with the intent', () => {
    expect(agentStepLabel(tool('searchTools', { intent: 'open deals' }))).toBe(
      'Searched tools for "open deals"',
    );
  });

  it('labels callTool reads', () => {
    expect(
      agentStepLabel(tool('callTool', { toolId: 'core.trpc.customers.find' })),
    ).toBe('Looked up customers');
    expect(
      agentStepLabel(
        tool('callTool', { toolId: 'core.trpc.customers.findOne' }),
      ),
    ).toBe('Opened customer');
    expect(
      agentStepLabel(tool('callTool', { toolId: 'sales.trpc.deal.count' })),
    ).toBe('Counted deals');
  });

  it('labels callTool mutations', () => {
    expect(
      agentStepLabel(tool('callTool', { toolId: 'sales.trpc.deal.create' })),
    ).toBe('Created deal');
    expect(
      agentStepLabel(tool('callTool', { toolId: 'sales.trpc.deal.update' })),
    ).toBe('Updated deal');
    expect(
      agentStepLabel(tool('callTool', { toolId: 'sales.trpc.deal.remove' })),
    ).toBe('Removed deal');
  });

  it('falls back to the path for other actions', () => {
    expect(
      agentStepLabel(
        tool('callTool', {
          toolId: 'frontline.trpc.inbox.conversations.changeStatus',
        }),
      ),
    ).toBe('Ran inbox.conversations.changeStatus');
  });

  it('labels readFile with the file name', () => {
    expect(
      agentStepLabel(tool('readFile', { url: '/files/abc/report%20q1.xlsx' })),
    ).toBe('Read report q1.xlsx');
  });

  it('labels execute_typescript', () => {
    expect(agentStepLabel(tool('execute_typescript', {}))).toBe('Ran code');
  });

  it('labels searchGraphql with the intent', () => {
    expect(
      agentStepLabel(tool('searchGraphql', { intent: 'open deals' })),
    ).toBe('Searched API for "open deals"');
    expect(agentStepLabel(tool('searchGraphql', {}))).toBe('Searched API');
  });

  it('labels callGraphql with the operation kind and root fields', () => {
    expect(
      agentStepLabel(
        tool('callGraphql', {
          query: 'query { customers { _id } deals { _id } }',
        }),
      ),
    ).toBe('Queried customers, deals');
    expect(
      agentStepLabel(
        tool('callGraphql', {
          query: 'mutation Edit { customersEdit(_id: "c1") { _id } }',
        }),
      ),
    ).toBe('Ran customersEdit');
  });

  it('falls back to a generic label for an unparseable callGraphql input', () => {
    expect(agentStepLabel(tool('callGraphql', { query: '{ broken {' }))).toBe(
      'Ran a GraphQL request',
    );
    expect(agentStepLabel(tool('callGraphql', {}))).toBe(
      'Ran a GraphQL request',
    );
  });
});

describe('describeToolCall', () => {
  it('describes callGraphql with the operation and the query/variables args', () => {
    expect(
      describeToolCall('callGraphql', {
        query: 'mutation { customersEdit { _id } }',
        variables: { id: 'c1' },
      }),
    ).toEqual({
      label: 'mutation customersEdit',
      args: {
        query: 'mutation { customersEdit { _id } }',
        variables: { id: 'c1' },
      },
    });
  });

  it('omits variables from callGraphql args when absent', () => {
    expect(describeToolCall('callGraphql', { query: '{ customers }' })).toEqual(
      {
        label: 'query customers',
        args: { query: '{ customers }' },
      },
    );
  });

  it('falls back to a generic label for a missing or invalid query', () => {
    expect(describeToolCall('callGraphql', {})).toEqual({
      label: 'GraphQL request',
      args: { query: undefined },
    });
  });
});

describe('agentMessageActivity', () => {
  it('uses the newest tool rather than earlier reply text', () => {
    expect(
      agentMessageActivity([
        textPart('I will check.'),
        toolPart('callGraphql', 'input-available', {
          query: '{ deals { _id } }',
        }),
        { type: 'step-start' },
      ]),
    ).toBe('Querying deals');
  });

  it('switches from tool execution to writing when reply text arrives', () => {
    expect(
      agentMessageActivity([
        toolPart('callGraphql', 'output-available', {
          query: '{ deals { _id } }',
        }),
        textPart('The report is ready.'),
      ]),
    ).toBe('Writing…');
  });

  it('switches from an earlier tool to new reasoning', () => {
    expect(
      agentMessageActivity([
        toolPart('callGraphql', 'output-available'),
        reasoningPart('Planning'),
      ]),
    ).toBe('Thinking…');
  });

  it('never describes a completed tool as still running', () => {
    expect(
      agentMessageActivity([toolPart('readFile', 'output-available')]),
    ).toBe('Working…');
  });

  it('identifies file generation independently from reply text', () => {
    expect(
      agentMessageActivity([toolPart('createArtifact', 'input-streaming')]),
    ).toBe('Creating file…');
  });

  it('has one default before any response part arrives', () => {
    expect(agentMessageActivity([])).toBe('Working…');
  });
});

describe('activity summary locale keys', () => {
  // The component calls t('step-count', { count }) — i18next resolves the
  // _one/_other forms; these keys must exist in both shipped locales.
  const en = JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../../backend',
        'gateway',
        'src/locales/en/common.json',
      ),
      'utf8',
    ),
  ) as { agent: Record<string, string> };
  const mn = JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '../../../../../../backend',
        'gateway',
        'src/locales/mn/common.json',
      ),
      'utf8',
    ),
  ) as { agent: Record<string, string> };

  it('has singular and plural step-count forms in both locales', () => {
    expect(en.agent['step-count_one']).toBe('{{count}} step');
    expect(en.agent['step-count_other']).toBe('{{count}} steps');
    expect(mn.agent['step-count_one']).toBeTruthy();
    expect(mn.agent['step-count_other']).toBeTruthy();
  });

  it('has the settled activity summaries in both locales', () => {
    for (const key of ['thought', 'thought-for', 'worked-for']) {
      expect(en.agent[key]).toBeTruthy();
      expect(mn.agent[key]).toBeTruthy();
    }
    expect(en.agent['worked-for']).toContain('{{duration}}');
    expect(mn.agent['worked-for']).toContain('{{duration}}');
  });
});
