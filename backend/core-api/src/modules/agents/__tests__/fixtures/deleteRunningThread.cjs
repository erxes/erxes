// Native cancellation prevents late completion from recreating deleted session memory.
const { createRequire } = require('node:module');
const req = createRequire(
  require('node:path').join(process.cwd(), 'backend/core-api/package.json'),
);
const load = (n) => import(req.resolve(n).replace(/\.cjs$/, '.js'));
const assert = require('node:assert/strict');
(async () => {
  const [
    { Agent },
    { createDurableAgent },
    { Mastra },
    { InMemoryStore },
    { Memory },
    { MockLanguageModelV3 },
  ] = await Promise.all([
    load('@mastra/core/agent'),
    load('@mastra/core/agent/durable'),
    load('@mastra/core/mastra'),
    load('@mastra/core/storage'),
    load('@mastra/memory'),
    load('ai/test'),
  ]);
  const storage = new InMemoryStore();
  const gate = Promise.withResolvers(),
    started = Promise.withResolvers();
  const model = new MockLanguageModelV3({
    doStream: async () => ({
      stream: new ReadableStream({
        async start(c) {
          c.enqueue({ type: 'text-start', id: 't' });
          c.enqueue({ type: 'text-delta', id: 't', delta: 'Partial' });
          started.resolve();
          await gate.promise;
          c.enqueue({ type: 'text-end', id: 't' });
          c.enqueue({
            type: 'finish',
            finishReason: { unified: 'stop', raw: 'stop' },
            usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
          });
          c.close();
        },
      }),
    }),
  });
  const memory = new Memory({ storage, options: { generateTitle: false } });
  await memory.createThread({ threadId: 'thread', resourceId: 'user' });
  const agent = createDurableAgent({
    agent: new Agent({
      id: 'deletion',
      name: 'Deletion',
      instructions: 'Test',
      model,
      memory,
    }),
    shouldPersistSnapshot: () => true,
    cleanupTimeoutMs: 10,
  });
  const mastra = new Mastra({
    agents: { test: agent },
    storage,
    workers: false,
    logger: false,
  });
  const result = await agent.stream('test', {
    memory: { thread: 'thread', resource: 'user' },
  });
  void (async () => {
    for await (const chunk of result.output.fullStream) {
    }
  })().catch(() => {});
  await started.promise;
  agent.abortRunStream(result.runId);
  const run = await agent.getWorkflow().createRun({ runId: result.runId });
  await run.cancel();
  await memory.deleteThread('thread');
  gate.resolve();
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(await memory.getThreadById({ threadId: 'thread' }), null);
  await assert.rejects(
    memory.recall({ threadId: 'thread', resourceId: 'user' }),
    /No thread found/,
  );
  await mastra.shutdown({ drainTimeout: 0 });
  process.exit(0);
})().catch((e) => {
  process.stderr.write(e.stack + '\n');
  process.exit(1);
});
