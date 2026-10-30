// Real installed Mastra runtime; no provider, Redis or workspace services are called.
import assert from 'node:assert/strict';
import { beforeEach, afterEach, mock, test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Agent } from '@mastra/core/agent';
import {
  createDurableAgent,
  agentThreadStreamRuntime,
} from '@mastra/core/agent/durable';
import { Mastra } from '@mastra/core/mastra';
import { InMemoryStore } from '@mastra/core/storage';
import { Memory } from '@mastra/memory';
import { MockLanguageModelV3 } from 'ai/test';
import { build } from 'esbuild';

const serviceRequire = createRequire(
  new URL('../../../../../package.json', import.meta.url),
);
const source = fileURLToPath(new URL('../../runLiveness.ts', import.meta.url));
const built = await build({
  entryPoints: [source],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  plugins: [
    {
      name: 'installed-mastra',
      setup(builder) {
        builder.onResolve({ filter: /^@mastra\// }, ({ path }) => ({
          path: pathToFileURL(
            serviceRequire.resolve(path).replace(/\.cjs$/, '.js'),
          ).href,
          external: true,
        }));
      },
    },
  ],
});
const { probeAgentsRun } = await import(
  'data:text/javascript;base64,' +
    Buffer.from(built.outputFiles[0].text).toString('base64')
);
// What the reconnect route's observer asks: is a producer still there?
const isAgentsRunAlive = async (...args) =>
  (await probeAgentsRun(...args)) === 'live';
const scope = { runId: 'orphan-run', threadId: 'thread', resourceId: 'user' };
let runtime;
let workflows;
let threadLease;

beforeEach(async () => {
  const storage = new InMemoryStore();
  const memory = new Memory({ storage, options: { generateTitle: false } });
  const agent = createDurableAgent({
    agent: new Agent({
      id: 'agents',
      name: 'agents',
      model: new MockLanguageModelV3({}),
      memory,
    }),
    shouldPersistSnapshot: () => true,
    cleanupTimeoutMs: 0,
  });
  const mastra = new Mastra({
    storage,
    agents: { agents: agent },
    workers: false,
    logger: false,
  });
  runtime = { memory, agent, mastra };
  workflows = await storage.getStore('workflows');
  threadLease = mock.method(
    agentThreadStreamRuntime,
    'isRunHoldingThreadLease',
    async () => false,
  );
  await workflows.persistWorkflowSnapshot({
    workflowName: 'durable-agentic-loop',
    runId: scope.runId,
    resourceId: scope.resourceId,
    snapshot: {
      runId: scope.runId,
      status: 'running',
      value: {},
      context: {
        input: {
          agentId: 'agents',
          __workflowKind: 'durable-agent',
          messageListState: { memoryInfo: scope },
        },
      },
      serializedStepGraph: [],
      activePaths: [],
      activeStepsPath: {},
      suspendedPaths: {},
      resumeLabels: {},
      waitingPaths: {},
      timestamp: 0,
    },
  });
});
afterEach(() => mock.restoreAll());

test('closes an orphaned observer and clears active discovery without replay', async () => {
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 1);
  const stream = mock.method(runtime.agent, 'stream');
  const recover = mock.method(runtime.agent, 'recover');
  const observed = await runtime.agent.observe(scope.runId, {
    idleTimeoutMs: 10,
    isAlive: () => isAgentsRunAlive(runtime, scope),
  });
  const chunks = [];
  try {
    for await (const chunk of observed.output.fullStream) chunks.push(chunk);
    assert(chunks.some((chunk) => chunk.type === 'error'));
    assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 0);
    assert.equal(stream.mock.callCount(), 0);
    assert.equal(recover.mock.callCount(), 0);
  } finally {
    observed.cleanup();
  }
});

test('keeps a slow producer alive based on native ownership', async () => {
  await workflows.claimRunOwnership({
    runId: scope.runId,
    ownerId: 'producer',
    leaseMs: 30_000,
  });
  assert.equal(await isAgentsRunAlive(runtime, scope), true);
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 1);
});

test('settles an expired ownership claim', async () => {
  await workflows.claimRunOwnership({
    runId: scope.runId,
    ownerId: 'crashed',
    leaseMs: 30_000,
  });
  const now = Date.now();
  mock.method(Date, 'now', () => now + 31_000);
  assert.equal(await isAgentsRunAlive(runtime, scope), false);
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 0);
});

test('preserves durable human-interaction gates without a producer', async () => {
  mock.method(runtime.agent, 'listSuspendedRuns', async () => ({
    runs: [{ runId: scope.runId, toolCalls: [] }],
    total: 1,
  }));
  const update = mock.method(workflows, 'updateWorkflowState');
  assert.equal(await isAgentsRunAlive(runtime, scope), true);
  assert.equal(update.mock.callCount(), 0);
});

test('uses native thread leases for standalone MongoDB and legacy runs', async () => {
  mock.method(workflows, 'supportsRunFencing', () => false);
  threadLease.mock.mockImplementation(async () => true);
  assert.equal(await isAgentsRunAlive(runtime, scope), true);
  threadLease.mock.mockImplementation(async () => false);
  assert.equal(await isAgentsRunAlive(runtime, scope), false);
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 0);
});

test('preserves a producer that claims the run during the probe', async () => {
  mock.method(workflows, 'claimRunOwnership', async () => ({
    acquired: false,
    record: null,
  }));
  const update = mock.method(workflows, 'updateWorkflowState');
  assert.equal(await isAgentsRunAlive(runtime, scope), true);
  assert.equal(update.mock.callCount(), 0);
});

test('does not settle a snapshot outside the authenticated scope', async () => {
  const update = mock.method(workflows, 'updateWorkflowState');
  assert.equal(
    await isAgentsRunAlive(runtime, { ...scope, resourceId: 'other-user' }),
    false,
  );
  assert.equal(update.mock.callCount(), 0);
});

test('propagates backend failures without declaring a producer dead', async () => {
  threadLease.mock.mockImplementation(async () => {
    throw new Error('Redis unavailable');
  });
  await assert.rejects(
    () => isAgentsRunAlive(runtime, scope),
    /Redis unavailable/,
  );
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 1);
});

test('reports a producerless run as interrupted at once, with the restart message', async () => {
  const started = Date.now();
  assert.equal(await probeAgentsRun(runtime, scope), 'interrupted');
  assert(Date.now() - started < 1_000);
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 0);
  const snapshot = await workflows.loadWorkflowSnapshot({
    workflowName: 'durable-agentic-loop',
    runId: scope.runId,
  });
  assert.equal(snapshot.status, 'failed');
  assert.equal(snapshot.error.name, 'AgentsRunInterrupted');
  assert.equal(
    snapshot.error.message,
    'The server restarted while answering. Retry to continue.',
  );
});

test('reports a live producer as live without touching the run', async () => {
  await workflows.claimRunOwnership({
    runId: scope.runId,
    ownerId: 'producer',
    leaseMs: 30_000,
  });
  assert.equal(await probeAgentsRun(runtime, scope), 'live');
  assert.equal((await runtime.agent.listActiveRuns(scope)).runs.length, 1);
});

test('never reports a run that already finished as interrupted', async () => {
  const snapshot = await workflows.loadWorkflowSnapshot({
    workflowName: 'durable-agentic-loop',
    runId: scope.runId,
  });
  await workflows.persistWorkflowSnapshot({
    workflowName: 'durable-agentic-loop',
    runId: scope.runId,
    resourceId: scope.resourceId,
    snapshot: { ...snapshot, status: 'success' },
  });
  assert.equal(await probeAgentsRun(runtime, scope), 'inactive');
});

test('never reports a run that finishes during the probe as interrupted', async () => {
  // The producer completes between the running read and the settle write:
  // the expected-running guard turns the write into a no-op.
  mock.method(workflows, 'updateWorkflowState', async () => undefined);
  assert.equal(await probeAgentsRun(runtime, scope), 'inactive');
});
