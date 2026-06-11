/**
 * Workflow kernel smoke test — runs the REAL Mastra execution path that Jest
 * cannot load (its CJS runtime rejects @mastra/core's dynamic-import chunks).
 *
 *   npx tsx scripts/workflow-smoke.ts
 *
 * Compiles a linear definition with stubbed effect handlers, executes it on a
 * fresh Mastra instance (in-memory, no storage, no network), and asserts the
 * happy path AND the schema-violation failure path. Exit 0 = kernel works.
 */
import {
  compileDefinition,
  CompiledDeps,
  finalOutput,
} from '../src/mastra/workflows/compiler';
import { WorkflowDefinition } from '../src/mastra/workflows/dsl';
import { buildManualEnvelope } from '../src/mastra/workflows/envelope';

const definition: WorkflowDefinition = {
  trigger: { type: 'manual', config: {} },
  policy: { mode: 'all', allowed: [] },
  bindings: { judge: { kind: 'agent', id: 'agent-1' } },
  limits: { maxLlmCalls: 10 },
  steps: [
    {
      id: 'classify',
      type: 'agent',
      agentRef: 'judge',
      prompt: 'Customer said: {{trigger.payload.text}}',
      outputSchema: { intent: 'enum:order,question', productName: 'string?' },
    },
    {
      id: 'create',
      type: 'operation',
      operation: 'dealsAdd',
      args: { name: 'Order: {{steps.classify.output.productName}}' },
    },
    {
      id: 'done',
      type: 'end',
      output: { dealId: '{{steps.create.output._id}}' },
    },
  ],
} as any;

// fs.writeSync over console.log so output survives process exit when piped.
import { writeSync } from 'fs';
const log = (line: string) => writeSync(1, line + '\n');

const assert = (cond: any, msg: string) => {
  if (!cond) {
    log(`✗ ${msg}`);
    process.exit(1);
  }
  log(`✓ ${msg}`);
};

(async () => {
  const calls: any[] = [];
  const deps: CompiledDeps = {
    executeOperation: async (operation, args) => {
      calls.push({ operation, args });
      return { _id: 'deal-9', name: args.name };
    },
    runJudgment: async ({ prompt }) => {
      calls.push({ prompt });
      return { intent: 'order', productName: 'Chair' };
    },
  };

  const wf: any = compileDefinition('smoke_wf', definition, deps);
  const run = wf.createRunAsync
    ? await wf.createRunAsync()
    : await wf.createRun();
  const result = await run.start({
    inputData: {
      trigger: buildManualEnvelope({ text: 'I want a chair' }, 'u1'),
      steps: {},
    },
  });

  assert(result.status === 'success', `run succeeds (status=${result.status})`);
  assert(
    calls[0]?.prompt === 'Customer said: I want a chair',
    'trigger payload resolved into the judgment prompt',
  );
  assert(
    calls[1]?.operation === 'dealsAdd' &&
      calls[1]?.args?.name === 'Order: Chair',
    'judgment output resolved into operation args',
  );
  const output = finalOutput(definition, result.result);
  assert(
    output?.dealId === 'deal-9',
    `end step produced the final output (${JSON.stringify(output)})`,
  );

  // Failure path: judgment violating its declared schema fails the run.
  const badDeps: CompiledDeps = {
    executeOperation: async () => ({}),
    runJudgment: async () => ({ intent: 'refund' }),
  };
  const badWf: any = compileDefinition('smoke_bad_wf', definition, badDeps);
  const badRun = badWf.createRunAsync
    ? await badWf.createRunAsync()
    : await badWf.createRun();
  const badResult = await badRun.start({
    inputData: {
      trigger: buildManualEnvelope({ text: 'hi' }, 'u1'),
      steps: {},
    },
  });
  assert(
    badResult.status === 'failed',
    `schema-violating judgment fails the run (status=${badResult.status})`,
  );
  assert(
    /not matching its schema/.test(
      String(badResult.error?.message || badResult.error),
    ),
    'failure carries the schema-violation error',
  );

  // Branch + parallel on the REAL engine: first-match routing, arm-state
  // unwrap, fan-out merge — the parts the Jest mock can only approximate.
  const branchDefinition: WorkflowDefinition = {
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
        outputSchema: { intent: 'enum:order,question,complaint' },
      },
      {
        id: 'route',
        type: 'branch',
        branches: [
          {
            when: "{{steps.classify.output.intent}} == 'order'",
            steps: [
              {
                id: 'createDeal',
                type: 'operation',
                operation: 'dealsAdd',
                args: { name: 'deal' },
              },
            ],
          },
          {
            when: "{{steps.classify.output.intent}} == 'complaint'",
            steps: [
              {
                id: 'createTicket',
                type: 'operation',
                operation: 'ticketsAdd',
                args: {},
              },
            ],
          },
        ],
        else: [
          { id: 'logOther', type: 'operation', operation: 'logsAdd', args: {} },
        ],
      },
      {
        id: 'fan',
        type: 'parallel',
        steps: [
          { id: 'fetchA', type: 'operation', operation: 'customers', args: {} },
          { id: 'fetchB', type: 'operation', operation: 'companies', args: {} },
        ],
      },
      {
        id: 'done',
        type: 'end',
        output: {
          taken: '{{steps.route.output.taken}}',
          deal: '{{steps.createDeal.output._id}}',
          a: '{{steps.fetchA.output.n}}',
          b: '{{steps.fetchB.output.n}}',
        },
      },
    ],
  } as any;

  const runBranch = async (intent: string) => {
    const ops: string[] = [];
    const bDeps: CompiledDeps = {
      executeOperation: async (operation) => {
        ops.push(operation);
        return { _id: `${operation}-id`, n: operation.length };
      },
      runJudgment: async () => ({ intent }),
    };
    const bWf: any = compileDefinition(
      `smoke_branch_${intent}`,
      branchDefinition,
      bDeps,
    );
    const bRun = bWf.createRunAsync
      ? await bWf.createRunAsync()
      : await bWf.createRun();
    const res = await bRun.start({
      inputData: {
        trigger: buildManualEnvelope({ text: intent }, 'u1'),
        steps: {},
      },
    });
    return { res, ops };
  };

  const order = await runBranch('order');
  assert(
    order.res.status === 'success',
    `branch run succeeds (status=${order.res.status})`,
  );
  assert(
    order.ops.join(',') === 'dealsAdd,customers,companies' ||
      order.ops.join(',') === 'dealsAdd,companies,customers',
    `order intent took arm 0 then fanned out (ops=${order.ops.join(',')})`,
  );
  const orderOut = finalOutput(branchDefinition, order.res.result);
  assert(
    orderOut?.taken?.endsWith('_route_b0'),
    `branch recorded the taken arm (${orderOut?.taken})`,
  );
  assert(
    orderOut?.deal === 'dealsAdd-id',
    'post-branch steps read the arm output',
  );
  assert(
    orderOut?.a === 'customers'.length && orderOut?.b === 'companies'.length,
    'parallel members merged into shared state',
  );

  const question = await runBranch('question');
  assert(
    question.ops[0] === 'logsAdd',
    `unmatched intent fell through to else (ops=${question.ops.join(',')})`,
  );

  log('\nWorkflow kernel smoke test: ALL PASS');
  process.exit(0);
})().catch((e) => {
  log(`✗ smoke test crashed: ${e?.stack || e}`);
  process.exit(1);
});
