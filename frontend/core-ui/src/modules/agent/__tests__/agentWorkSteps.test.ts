import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DynamicToolUIPart, UIMessage } from 'ai';

import {
  agentStepLabel,
  agentToolActivity,
  describeToolCall,
  isStandalonePart,
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
    expect(toAgentWorkStep(approval)).toBeNull();
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

// Text, reasoning and settled-tool labels are covered by agentTurnActivity.
describe('agentToolActivity', () => {
  it.each([
    ['callGraphql', { query: '{ deals { _id } }' }, 'Querying deals'],
    ['createArtifact', {}, 'Creating file…'],
    ['readFile', { url: '/files/brief.pdf' }, 'Reading brief.pdf'],
    ['somethingElse', {}, 'Working…'],
  ])('labels a running %s call', (toolName, input, label) => {
    expect(
      agentToolActivity(
        toolPart(toolName, 'input-available', input) as DynamicToolUIPart,
      ),
    ).toBe(label);
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

  it('hints @ mentions in the composer placeholder in both locales', () => {
    expect(en.agent['composer-placeholder']).toBe('Ask anything, @ to mention');
    expect(mn.agent['composer-placeholder']).toContain('@');
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
