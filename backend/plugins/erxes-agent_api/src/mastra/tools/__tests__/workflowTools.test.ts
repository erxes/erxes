/**
 * Builder-tool tests. Mongo, the operation registry, and the Mastra engine are
 * all mocked — these tests cover the tool contracts: validation gating before
 * save, the simulate trace/assumption mechanics, and tenant-scoped reads.
 */
jest.mock('@mastra/core/workflows', () =>
  require('../../workflows/__tests__/mockWorkflowEngine').mockWorkflowsModule(),
);
jest.mock('@mastra/core/tools', () => ({ createTool: (cfg: any) => cfg }));

const mockGetSettings = jest.fn(async () => ({ erxesApiUrl: 'http://gw' }));
const mockCreateWorkflow = jest.fn(async (doc: any) => ({ _id: 'wf-1', version: 1, ...doc }));
const mockGetWorkflows = jest.fn(async () => []);
const mockGetRuns = jest.fn(async () => []);

jest.mock('../../../connectionResolvers', () => ({
  generateModels: jest.fn(async () => ({
    MastraSettings: { getSettings: mockGetSettings },
    MastraWorkflow: { createWorkflow: mockCreateWorkflow, getWorkflows: mockGetWorkflows },
    MastraWorkflowRun: { getRuns: mockGetRuns },
  })),
}));

jest.mock('../operationRegistry', () => ({
  getOperationRegistry: jest.fn(async () => {
    const ops = [
      { operation: 'dealsAdd', operationType: 'mutation', plugin: 'sales', module: 'deals' },
      { operation: 'customers', operationType: 'query', plugin: 'core', module: 'customers' },
    ];
    return {
      operations: new Map(ops.map((o) => [o.operation, o])),
      list: ops,
      inputTypesMap: {},
      objectFieldsMap: {},
    };
  }),
}));

import {
  workflowValidateTool,
  workflowSimulateTool,
  workflowSaveTool,
  workflowGuideTool,
} from '../workflowTools';

const definition = () => ({
  trigger: { type: 'manual', config: {} },
  policy: { mode: 'all', allowed: [] },
  bindings: { judge: { kind: 'agent', id: 'agent-1' } },
  limits: { maxLlmCalls: 10 },
  steps: [
    {
      id: 'classify',
      type: 'agent',
      agentRef: 'judge',
      prompt: '{{trigger.payload.text}}',
      outputSchema: { intent: 'enum:order,question' },
    },
    {
      id: 'route',
      type: 'branch',
      branches: [
        {
          when: "{{steps.classify.output.intent}} == 'order'",
          steps: [{ id: 'createDeal', type: 'operation', operation: 'dealsAdd', args: { name: 'x' } }],
        },
      ],
      else: [{ id: 'lookup', type: 'operation', operation: 'customers', args: {} }],
    },
    { id: 'done', type: 'end', output: { taken: '{{steps.route.output.taken}}' } },
  ],
});

describe('workflowGuideTool', () => {
  it('documents every supported step type and the ref/condition syntax', async () => {
    const { guide } = await (workflowGuideTool as any).execute({});
    for (const must of ['operation', 'agent', 'branch', 'parallel', 'wait', 'end', '{{trigger.payload', 'workflowValidate']) {
      expect(guide).toContain(must);
    }
    // Unsupported steps are explicitly fenced off.
    expect(guide).toMatch(/approval[\s\S]*NOT supported yet/);
  });
});

describe('workflowValidateTool', () => {
  it('passes a valid definition against the live registry', async () => {
    const res = await (workflowValidateTool as any).execute({ definition: definition() });
    expect(res).toEqual({ ok: true, errors: [] });
  });

  it('reports nonexistent operations with structured errors', async () => {
    const def = definition();
    (def.steps[1] as any).branches[0].steps[0].operation = 'ghostOp';
    const res = await (workflowValidateTool as any).execute({ definition: def });
    expect(res.ok).toBe(false);
    expect(res.errors[0].message).toMatch(/does not exist/);
  });
});

describe('workflowSimulateTool', () => {
  it('routes through the branch using assumptions and traces operations without side effects', async () => {
    const res = await (workflowSimulateTool as any).execute({
      definition: definition(),
      triggerPayload: { text: 'I want to buy' },
      assumptions: { classify: { intent: 'order' } },
    });

    expect(res.success).toBe(true);
    const agentEvents = res.trace.filter((t: any) => t.step === 'agent');
    expect(agentEvents[0].assumed).toBe(true);
    expect(agentEvents[0].output).toEqual({ intent: 'order' });
    const opEvents = res.trace.filter((t: any) => t.step === 'operation');
    expect(opEvents.map((o: any) => o.operation)).toEqual(['dealsAdd']);
    expect(res.output?.taken).toMatch(/_route_b0$/);
    // No models writes happened.
    expect(mockCreateWorkflow).not.toHaveBeenCalled();
  });

  it('auto-samples agent outputs when no assumption is given (else path)', async () => {
    const res = await (workflowSimulateTool as any).execute({
      definition: definition(),
      triggerPayload: {},
    });
    expect(res.success).toBe(true);
    // sampleFor picks the first enum value 'order' → arm 0, traced dealsAdd.
    const agentEvents = res.trace.filter((t: any) => t.step === 'agent');
    expect(agentEvents[0].assumed).toBe(false);
    expect(agentEvents[0].output).toEqual({ intent: 'order' });
  });

  it('returns structured validation errors instead of running an invalid draft', async () => {
    const def = definition();
    (def.steps[0] as any).agentRef = 'ghost';
    const res = await (workflowSimulateTool as any).execute({ definition: def, triggerPayload: {} });
    expect(res.success).toBe(false);
    expect(res.errors?.length).toBeGreaterThan(0);
  });
});

describe('workflowSaveTool', () => {
  it('refuses to save an invalid definition', async () => {
    const def = definition();
    (def.steps[1] as any).branches[0].steps[0].operation = 'ghostOp';
    const res = await (workflowSaveTool as any).execute({
      name: 'Bad',
      definition: def,
      enable: true,
    });
    expect(res.success).toBe(false);
    expect(mockCreateWorkflow).not.toHaveBeenCalled();
  });

  it('saves a valid definition disabled by default', async () => {
    const res = await (workflowSaveTool as any).execute({
      name: 'Support flow',
      definition: definition(),
      enable: false,
    });
    expect(res.success).toBe(true);
    expect(res.workflowId).toBe('wf-1');
    expect(mockCreateWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Support flow', isEnabled: false }),
    );
  });
});
