// Real installed Mastra runtime, AI SDK pipe and HTTP; no provider, Redis or
// workspace services are called.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Agent } from '@mastra/core/agent';
import { createDurableAgent } from '@mastra/core/agent/durable';
import { Mastra } from '@mastra/core/mastra';
import { InMemoryStore } from '@mastra/core/storage';
import { Memory } from '@mastra/memory';
import { MockLanguageModelV3 } from 'ai/test';
import { build } from 'esbuild';

const serviceRequire = createRequire(
  new URL('../../../../../package.json', import.meta.url),
);
const installed = (path) => ({
  path: pathToFileURL(serviceRequire.resolve(path).replace(/\.cjs$/, '.js'))
    .href,
  external: true,
});
const built = await build({
  entryPoints: [fileURLToPath(new URL('../../agentsStream.ts', import.meta.url))],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  plugins: [
    {
      name: 'installed-packages',
      setup(builder) {
        builder.onResolve({ filter: /^(@mastra\/|ai$)/ }, ({ path }) =>
          installed(path),
        );
      },
    },
  ],
});
const { interruptAgentsStreams, pipeAgentsStream } = await import(
  'data:text/javascript;base64,' +
    Buffer.from(built.outputFiles[0].text).toString('base64')
);

// The model starts a reply, then goes quiet until a test releases it — the
// shape of a long tool call or a slow provider.
let release;
const model = new MockLanguageModelV3({
  doStream: async () => ({
    stream: new ReadableStream({
      async start(controller) {
        controller.enqueue({ type: 'text-start', id: 'text' });
        controller.enqueue({ type: 'text-delta', id: 'text', delta: 'Partial' });
        await new Promise((resolve) => {
          release = resolve;
        });
        controller.enqueue({ type: 'text-end', id: 'text' });
        controller.enqueue({
          type: 'finish',
          finishReason: { unified: 'stop', raw: 'stop' },
          usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
        });
        controller.close();
      },
    }),
  }),
});
const storage = new InMemoryStore();
const memory = new Memory({ storage, options: { generateTitle: false } });
const agent = createDurableAgent({
  agent: new Agent({ id: 'agents', name: 'agents', model, memory }),
  shouldPersistSnapshot: () => true,
  cleanupTimeoutMs: 0,
});
const mastra = new Mastra({
  storage,
  agents: { agents: agent },
  workers: false,
  logger: false,
});
let thread = 0;
// `/observed` pipes the run the way reconnect does: as an observer of a run
// another process may be producing.
const server = createServer(async (req, res) => {
  thread += 1;
  const { output } = await agent.stream('Hello', {
    memory: { thread: `thread-${thread}`, resource: 'user' },
  });
  await pipeAgentsStream(res, `thread-${thread}`, output, {
    keepAliveMs: 50,
    observed: req.url === '/observed',
  });
});
let url;
before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await mastra.shutdown();
});

/** Reads the raw SSE body until `until` matches it or the response ends. */
const read = async (response, until) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const { done, value } = await reader.read();
    if (done) return { text, ended: true, reader };
    text += decoder.decode(value, { stream: true });
    if (until?.(text)) return { text, ended: false, reader };
  }
  throw new Error(`Timed out reading the stream: ${text}`);
};
const events = (text) =>
  text
    .split('\n\n')
    .filter((event) => event.startsWith('data: ') && event !== 'data: [DONE]')
    .map((event) => JSON.parse(event.slice('data: '.length)));

test('keeps a quiet run visibly alive, then finishes normally', async () => {
  const response = await fetch(url);
  assert.equal(response.headers.get('x-agents-thread-id'), 'thread-1');
  const quiet = await read(response, (text) =>
    /Partial[\s\S]*: keep-alive\n\n[\s\S]*: keep-alive\n\n/.test(text),
  );
  assert.equal(quiet.ended, false);
  release();
  let rest = '';
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await quiet.reader.read();
    if (done) break;
    rest += decoder.decode(value, { stream: true });
  }
  const chunks = events(quiet.text + rest);
  assert(chunks.some((chunk) => chunk.type === 'finish'));
  assert(!chunks.some((chunk) => chunk.type === 'error'));
});

/** Reads the rest of a stream; a dropped connection rejects. */
const drain = async (reader) => {
  const decoder = new TextDecoder();
  let rest = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return rest;
    rest += decoder.decode(value, { stream: true });
  }
};

test('on shutdown, ends its own runs with the restart error and drops observers', async () => {
  const produced = await read(await fetch(url), (text) =>
    text.includes('Partial'),
  );
  const observed = await read(await fetch(`${url}/observed`), (text) =>
    text.includes('Partial'),
  );
  interruptAgentsStreams();

  // This process produced the run, and it dies with the process.
  const errors = events(produced.text + (await drain(produced.reader))).filter(
    (chunk) => chunk.type === 'error',
  );
  assert.equal(errors.length, 1);
  assert.deepEqual(JSON.parse(errors[0].errorText), {
    error: 'The server restarted while answering. Retry to continue.',
    code: 'AGENTS_RUN_INTERRUPTED',
  });

  // Another process may be producing an observed run: the connection drops
  // without a verdict, so the client reconnects elsewhere.
  await assert.rejects(() => drain(observed.reader));
  assert(!observed.text.includes('AGENTS_RUN_INTERRUPTED'));
});
