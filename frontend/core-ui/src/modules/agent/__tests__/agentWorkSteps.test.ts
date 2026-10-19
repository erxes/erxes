import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { UIMessage } from 'ai';

import {
  agentStepLabel,
  agentMessageActivity,
  describeToolCall,
  groupAgentWorkSteps,
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

describe('groupAgentWorkSteps', () => {
  it('groups contiguous reasoning + tool parts into one work item', () => {
    const items = groupAgentWorkSteps([
      reasoningPart('thinking'),
      toolPart('searchTools', 'output-available', { intent: 'deals' }),
      toolPart('callTool', 'output-available', {
        toolId: 'sales.trpc.deal.find',
      }),
      textPart('done'),
      toolPart('callTool', 'input-available', { toolId: 'x.trpc.y.z' }),
    ]);

    expect(items).toHaveLength(3);
    expect(items[0].kind).toBe('work');
    expect((items[0] as { steps: unknown[] }).steps).toHaveLength(3);
    expect(items[1].kind).toBe('part');
    expect(items[2].kind).toBe('work');
    expect((items[2] as { steps: unknown[] }).steps).toHaveLength(1);
  });

  it('treats step-start as transparent', () => {
    const items = groupAgentWorkSteps([
      toolPart('callTool', 'output-available', { toolId: 'a.trpc.b.c' }),
      { type: 'step-start' },
      reasoningPart('more'),
    ]);

    expect(items).toHaveLength(1);
    expect((items[0] as { steps: unknown[] }).steps).toHaveLength(2);
  });

  it('keeps approval-requested parts standalone', () => {
    const approval = toolPart('callTool', 'approval-requested', {
      toolId: 'x.trpc.a.b',
    });
    (approval as { approval?: { id: string } }).approval = { id: 'ap-1' };

    const items = groupAgentWorkSteps([
      reasoningPart('t'),
      approval,
      reasoningPart('u'),
    ]);

    expect(items).toHaveLength(3);
    expect(items[1].kind).toBe('part');
    expect((items[0] as { steps: unknown[] }).steps).toHaveLength(1);
    expect((items[2] as { steps: unknown[] }).steps).toHaveLength(1);
  });

  it('keeps askUser tool parts standalone', () => {
    const items = groupAgentWorkSteps([
      toolPart('askUser', 'output-available', {}, {}),
    ]);

    expect(items).toEqual([expect.objectContaining({ kind: 'part' })]);
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

describe('work-steps summary pluralisation', () => {
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
});
