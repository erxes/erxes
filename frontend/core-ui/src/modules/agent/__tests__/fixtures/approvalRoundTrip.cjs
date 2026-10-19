// Real SDK + Mastra integration, with an in-memory store and a scripted model.
// No provider, CRM service, or production conversation is called or modified.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const repo = process.cwd();
const serviceRequire = createRequire(
  path.join(repo, 'backend/core-api/package.json'),
);
const rootRequire = createRequire(path.join(repo, 'package.json'));
const load = (name) =>
  import(serviceRequire.resolve(name).replace(/\.cjs$/, '.js'));

(async () => {
  const [
    { Agent },
    { createDurableAgent },
    { Mastra },
    { InMemoryStore },
    { Memory },
    { createTool },
    { MockLanguageModelV3 },
    { toAISdkStream },
    ai,
    { Chat },
    { z },
  ] = await Promise.all([
    load('@mastra/core/agent'),
    load('@mastra/core/agent/durable'),
    load('@mastra/core/mastra'),
    load('@mastra/core/storage'),
    load('@mastra/memory'),
    load('@mastra/core/tools'),
    load('ai/test'),
    load('@mastra/ai-sdk'),
    load('ai'),
    load('@ai-sdk/react'),
    load('zod/v4'),
  ]);
  const built = await rootRequire('esbuild').build({
    stdin: {
      contents: `export { AgentsChatTransport } from './frontend/core-ui/src/modules/agent/transport';
      export { hasAgentsApprovalDecision } from './frontend/core-ui/src/modules/agent/approvalDecisions';`,
      resolveDir: repo,
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    plugins: [
      {
        name: 'fixture',
        setup(build) {
          build.onResolve({ filter: /^ai$/ }, () => ({
            path: pathToFileURL(
              serviceRequire.resolve('ai').replace(/\.cjs$/, '.js'),
            ).href,
            external: true,
          }));
          build.onResolve({ filter: /^erxes-ui$/ }, () => ({
            path: 'env',
            namespace: 'fixture',
          }));
          build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: `export const REACT_APP_API_URL='http://fixture';`,
            loader: 'js',
          }));
        },
      },
    ],
  });
  const { AgentsChatTransport, hasAgentsApprovalDecision } = await import(
    'data:text/javascript;base64,' +
      Buffer.from(built.outputFiles[0].text).toString('base64')
  );
  const executed = [];
  let modelCalls = 0;
  const model = new MockLanguageModelV3({
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          if (modelCalls++ === 0) {
            for (const [id, query] of [
              ['read', 'query Read'],
              ['write-a', 'mutation A'],
              ['write-b', 'mutation B'],
              ['later-read', 'query Later'],
            ]) {
              controller.enqueue({
                type: 'tool-call',
                toolCallId: id,
                toolName: 'callGraphql',
                input: JSON.stringify({ query }),
              });
            }
          } else {
            controller.enqueue({ type: 'text-start', id: 'text' });
            controller.enqueue({
              type: 'text-delta',
              id: 'text',
              delta: 'Completed report',
            });
            controller.enqueue({ type: 'text-end', id: 'text' });
          }
          controller.enqueue({
            type: 'finish',
            finishReason: {
              unified: modelCalls === 1 ? 'tool-calls' : 'stop',
              raw: modelCalls === 1 ? 'tool_calls' : 'stop',
            },
            usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
          });
          controller.close();
        },
      }),
    }),
  });
  const tool = createTool({
    id: 'callGraphql',
    description: 'Fixture',
    inputSchema: z.object({ query: z.string() }),
    requireApproval: ({ query }) => query.startsWith('mutation'),
    execute: ({ query }) => {
      executed.push(query);
      return { status: 'ok' };
    },
  });
  const storage = new InMemoryStore();
  const memory = new Memory({ storage, options: { generateTitle: false } });
  const agent = createDurableAgent({
    agent: new Agent({
      id: 'approval-test',
      name: 'Approval test',
      instructions: 'Test',
      model,
      memory,
      tools: { callGraphql: tool },
    }),
    maxSteps: 4,
    shouldPersistSnapshot: () => true,
    cleanupTimeoutMs: 0,
  });
  const mastra = new Mastra({
    agents: { test: agent },
    storage,
    workers: false,
    logger: false,
  });
  let runId;
  let first;
  const requests = [];
  const failures = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push({ url: String(url), body });
    let output;
    if (String(url).endsWith('/approve')) {
      output = await agent[
        body.approved ? 'approveToolCall' : 'declineToolCall'
      ]({ runId, toolCallId: body.toolCallId, maxSteps: 4 });
    } else {
      first = await agent.stream('Report', {
        runId: body.runId,
        closeOnSuspend: true,
        memory: { thread: 'thread', resource: 'user' },
      });
      output = first.output;
    }
    return ai.createUIMessageStreamResponse({
      stream: toAISdkStream(output, { from: 'agent', version: 'v7' }),
    });
  };
  try {
    const transport = new AgentsChatTransport({
      getThreadId: () => 'thread',
      getRequestSelection: () => ({}),
      getActiveRunId: () => runId,
      onActiveRunId: (id) => {
        runId = id;
      },
      onThreadId: () => {},
      consumePendingAnswer: () => undefined,
    });
    const chat = new Chat({
      transport,
      sendAutomaticallyWhen: hasAgentsApprovalDecision,
      onError: (error) => failures.push(error.message),
    });
    await chat.sendMessage({ text: 'Report' });
    const last = () => chat.messages.at(-1);
    const waitFor = async (predicate) => {
      for (let count = 0; count < 200; count++) {
        if (predicate()) return;
        if (failures.length) throw new Error(failures.join('; '));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error(
        'Timed out: ' +
          JSON.stringify({
            status: chat.status,
            parts: last()?.parts,
            requests,
          }),
      );
    };
    const approval = () =>
      last().parts.find((part) => part.state === 'approval-requested');
    assert.equal(approval().toolCallId, 'write-a');
    assert.equal(
      last().parts.find((part) => part.toolCallId === 'later-read').state,
      'input-available',
    );
    // The previous SDK predicate deadlocks on these unexecuted later calls.
    const decided = structuredClone(chat.messages);
    const decision = decided
      .at(-1)
      .parts.find((part) => part.toolCallId === 'write-a');
    decision.state = 'approval-responded';
    decision.approval.approved = true;
    assert.equal(
      ai.lastAssistantMessageIsCompleteWithApprovalResponses({
        messages: decided,
      }),
      false,
    );
    assert.equal(hasAgentsApprovalDecision({ messages: decided }), true);
    await chat.addToolApprovalResponse({
      id: approval().approval.id,
      approved: true,
    });
    await waitFor(
      () => chat.status === 'ready' && approval()?.toolCallId === 'write-b',
    );
    assert.deepEqual(executed, ['query Read', 'mutation A']);
    await chat.addToolApprovalResponse({
      id: approval().approval.id,
      approved: false,
      reason: 'No',
    });
    await waitFor(
      () =>
        chat.status === 'ready' &&
        last().parts.some(
          (part) => part.type === 'text' && part.text === 'Completed report',
        ),
    );
    assert.deepEqual(executed, ['query Read', 'mutation A', 'query Later']);
    assert.deepEqual(
      requests
        .filter((entry) => entry.url.endsWith('/approve'))
        .map((entry) => [entry.body.toolCallId, entry.body.approved]),
      [
        ['write-a', true],
        ['write-b', false],
      ],
    );
    assert.equal(
      requests.filter((entry) => entry.url.endsWith('/chat')).length,
      1,
    );
    assert.equal(modelCalls, 2);
    assert.deepEqual(failures, []);
    first.cleanup();
  } finally {
    global.fetch = originalFetch;
    await mastra.shutdown();
  }
})().catch((error) => {
  process.stderr.write(String(error.stack) + '\n');
  process.exitCode = 1;
});
