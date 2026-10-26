// Real AI SDK Chat + the agents transport against scripted HTTP responses
// shaped like the gateway's: a server restart leaves the reply connection
// open and silent. No server, provider or conversation is called.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const repo = path.resolve(__dirname, '../../../../../../..');
const serviceRequire = createRequire(
  path.join(repo, 'backend/core-api/package.json'),
);
const rootRequire = createRequire(path.join(repo, 'package.json'));
const load = (name) =>
  import(serviceRequire.resolve(name).replace(/\.cjs$/, '.js'));

const STALL_MS = 150;
const encoder = new TextEncoder();
const sse = (chunk) => `data: ${JSON.stringify(chunk)}\n\n`;
const reply = (text) => [
  sse({ type: 'start' }),
  sse({ type: 'start-step' }),
  sse({ type: 'text-start', id: 't' }),
  sse({ type: 'text-delta', id: 't', delta: text }),
];
const finish = [
  sse({ type: 'text-end', id: 't' }),
  sse({ type: 'finish-step' }),
  sse({ type: 'finish' }),
  'data: [DONE]\n\n',
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** An SSE response that writes `events` (strings, or pauses in ms). */
const stream = (events, { open = false } = {}) =>
  new Response(
    new ReadableStream({
      async start(controller) {
        for (const event of events) {
          if (typeof event === 'number') await sleep(event);
          else controller.enqueue(encoder.encode(event));
        }
        if (!open) controller.close();
      },
    }),
    { headers: { 'content-type': 'text/event-stream' } },
  );

// A silent connection leaves nothing scheduled, so a hang would otherwise
// end the process quietly with exit code 0.
let finished = false;
process.on('beforeExit', () => {
  if (finished) return;
  finished = true;
  process.stderr.write('The scenario never finished: a request hung.\n');
  process.exitCode = 1;
});

(async () => {
  const [{ Chat }] = await Promise.all([load('@ai-sdk/react')]);
  const built = await rootRequire('esbuild').build({
    stdin: {
      contents: `export { AgentsChatTransport } from './frontend/core-ui/src/modules/agent/transport';
      export { isAgentsRunInterrupted, isAgentsStreamStalled } from './frontend/core-ui/src/modules/agent/streamHealth';`,
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
  const { AgentsChatTransport, isAgentsRunInterrupted, isAgentsStreamStalled } =
    await import(
      'data:text/javascript;base64,' +
        Buffer.from(built.outputFiles[0].text).toString('base64')
    );

  const responses = [];
  const requests = [];
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    requests.push(String(url).replace('http://fixture/pl:core', ''));
    const next = responses.shift();
    assert(next, `Unexpected request to ${url}`);
    return next();
  };
  let runId;
  const transport = new AgentsChatTransport({
    getThreadId: () => 'thread',
    getRequestSelection: () => ({}),
    getActiveRunId: () => runId,
    onActiveRunId: (id) => {
      runId = id;
    },
    onThreadId: () => {},
    consumePendingAnswer: () => undefined,
    stallTimeoutMs: STALL_MS,
  });
  const chat = new Chat({ transport });
  const text = () =>
    chat.messages
      .at(-1)
      ?.parts.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');

  try {
    // Keep-alive comments carry a quiet reply past the stall window.
    responses.push(() =>
      stream([
        ': stream-open\n\n',
        ...reply('Quiet'),
        ...Array.from({ length: 6 }, () => [50, ': keep-alive\n\n']).flat(),
        ...finish,
      ]),
    );
    await chat.sendMessage({ text: 'Slow question' });
    assert.equal(chat.status, 'ready');
    assert.equal(chat.error, undefined);
    assert.equal(text(), 'Quiet');

    // The server restarts mid-reply: the connection stays open, silent.
    responses.push(() =>
      stream([': stream-open\n\n', ...reply('Partial')], { open: true }),
    );
    const started = Date.now();
    await chat.sendMessage({ text: 'Question' });
    assert(Date.now() - started < STALL_MS * 10, 'the stall was not detected');
    assert.equal(chat.status, 'error');
    assert(isAgentsStreamStalled(chat.error));
    const interruptedRun = runId;
    assert(interruptedRun, 'a lost connection keeps the run reconnectable');

    // Reconnecting finds the run's producer gone.
    responses.push(
      () =>
        new Response(
          JSON.stringify({
            error: 'The server restarted while answering. Retry to continue.',
            code: 'AGENTS_RUN_INTERRUPTED',
          }),
          { status: 409 },
        ),
    );
    await chat.resumeStream();
    assert.equal(chat.status, 'error');
    assert(isAgentsRunInterrupted(chat.error));
    assert.equal(runId, undefined);

    // Retry answers the same question again.
    responses.push(() => stream([...reply('Answer'), ...finish]));
    await chat.regenerate();
    assert.equal(chat.status, 'ready');
    assert.equal(chat.error, undefined);
    assert.equal(text(), 'Answer');
    assert.notEqual(runId, interruptedRun);
    assert.deepEqual(requests, [
      '/agents/chat',
      '/agents/chat',
      '/agents/chat/reconnect',
      '/agents/chat',
    ]);

    // A shutdown ends the reply with the restart error instead.
    responses.push(() =>
      stream([
        ...reply('Cut'),
        sse({
          type: 'error',
          errorText: JSON.stringify({
            error: 'The server restarted while answering. Retry to continue.',
            code: 'AGENTS_RUN_INTERRUPTED',
          }),
        }),
      ]),
    );
    await chat.sendMessage({ text: 'Another question' });
    assert.equal(chat.status, 'error');
    assert(isAgentsRunInterrupted(chat.error));
    assert(!isAgentsStreamStalled(chat.error));
    finished = true;
  } finally {
    global.fetch = originalFetch;
  }
})().catch((error) => {
  process.stderr.write(String(error.stack) + '\n');
  process.exitCode = 1;
});
