// Runs one extension function in the real workerd sandbox against a fixture,
// with no Mongo, Redis or plugins. `ctx.db` runs against an in-memory copy of
// the fixture's `db`, with Mongo filter semantics from mingo.
//
//   npx tsx scripts/try.ts <extDir> <fixture.json>
//
// fixture.json: { "function": "<name>", "input": {...},
//                 "db": { "<collection>": [<document>, ...] },
//                 "tools": { "<host>.<entry>": <result>, ... } }
// `tools` mocks contract calls: "sales.deals.get" answers
// ctx.erxes.sales.deals.get. The call still needs the pin in `uses`, and
// input and the mocked result still parse against the pinned contract.
// Prints { ok, data | error, ms, writes } and exits 1 unless ok. `writes` are
// the inserts, updates and deletes the extension made on its own collections.
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Query } from 'mingo';
import { createServer } from 'node:http';
import { z } from 'zod';
import { HostCallRequest, runContractCall } from '../src/contracts';
import { ApiError } from '../src/errors';
import { HostDbRequest, parseDbOp } from '../src/hostDb';
import { LIMITS } from '../src/limits';
import { bundleExtension, describeExtension } from './bundle';
import {
  createToken,
  startWorkerd,
  waitUntilListening,
} from '../src/workerd/launch';

const HOST_PORT = Number(process.env.EXT_TRY_HOST_PORT || 3340);
const SUPERVISOR_PORT = Number(process.env.EXT_TRY_SUPERVISOR_PORT || 3341);

const fixtureSchema = z.object({
  function: z.string(),
  input: z.unknown().optional(),
  db: z
    .record(z.string(), z.array(z.record(z.string(), z.unknown())))
    .default({}),
  tools: z.record(z.string(), z.unknown()).default({}),
});

type Doc = Record<string, unknown>;

// The runtime's own checks (operators, args), then the same operations on
// arrays.
const runDbOp = (
  store: Record<string, Doc[]>,
  writes: { collection: string; op: string; doc: unknown }[],
  request: z.infer<typeof HostDbRequest>,
) => {
  const call = parseDbOp(request);
  const docs = (store[request.collection] ??= []);
  const matches = () =>
    new Query(call.op === 'insertOne' ? {} : call.query).find<Doc>(docs);
  const write = (doc: Doc) => {
    writes.push({ collection: request.collection, op: call.op, doc });
    return doc;
  };
  const now = new Date().toISOString();

  switch (call.op) {
    case 'find': {
      const cursor = matches();
      return (
        Object.keys(call.sort).length > 0 ? cursor.sort(call.sort) : cursor
      )
        .skip(call.skip)
        .limit(call.limit)
        .all();
    }
    case 'findOne':
      return matches().limit(1).all()[0] ?? null;
    case 'count':
      return matches().all().length;
    case 'insertOne': {
      const doc = {
        ...call.doc,
        _id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      docs.push(doc);
      return write(doc);
    }
    case 'updateOne': {
      const doc = matches().limit(1).all()[0];
      return doc
        ? write(Object.assign(doc, call.set, { updatedAt: now }))
        : null;
    }
    case 'deleteOne': {
      const doc = matches().limit(1).all()[0];
      if (!doc) return null;
      docs.splice(docs.indexOf(doc), 1);
      return write(doc);
    }
  }
};

const [extDir, fixturePath] = process.argv.slice(2);

const main = async () => {
  if (!extDir || !fixturePath) {
    throw new Error('usage: try.ts <extDir> <fixture.json>');
  }

  const ext = await describeExtension(extDir);
  const fixture = fixtureSchema.parse(
    JSON.parse(await readFile(fixturePath, 'utf8')),
  );

  if (!ext.functions.includes(fixture.function)) {
    throw new Error(
      `function ${fixture.function} is not one of ${JSON.stringify(
        ext.functions,
      )}`,
    );
  }

  const token = createToken();
  const writes: { collection: string; op: string; doc: unknown }[] = [];
  const store = structuredClone(fixture.db);

  const handle = async (url: string | undefined, body: string) => {
    if (url !== '/contract') {
      return runDbOp(store, writes, HostDbRequest.parse(JSON.parse(body)));
    }

    return runContractCall(
      ext.uses,
      HostCallRequest.parse(JSON.parse(body)),
      async ({ host, entry }) => {
        const key = `${host}.${entry.name}`;

        if (!(key in fixture.tools)) {
          throw new ApiError(
            404,
            'NOT_MOCKED',
            `Add "${key}" to the fixture's tools`,
          );
        }

        return fixture.tools[key];
      },
    );
  };

  const stub = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (req.headers['x-ext-runtime-token'] !== token) {
        res.writeHead(401).end();
        return;
      }

      res.setHeader('content-type', 'application/json');

      handle(req.url, body).then(
        (data) => res.end(JSON.stringify({ ok: true, data })),
        (e: unknown) => {
          const error =
            e instanceof ApiError
              ? e.body()
              : { code: 'DB_ERROR', message: String(e) };
          res.writeHead(400).end(JSON.stringify({ ok: false, error }));
        },
      );
    });
  });

  await new Promise<void>((resolve) =>
    stub.listen(HOST_PORT, '127.0.0.1', resolve),
  );

  const workerd = await startWorkerd({
    hostPort: HOST_PORT,
    supervisorPort: SUPERVISOR_PORT,
    token,
  });

  let exitCode = 1;

  try {
    await waitUntilListening(`http://127.0.0.1:${SUPERVISOR_PORT}/`);

    const code = await bundleExtension(extDir);
    const res = await fetch(`http://127.0.0.1:${SUPERVISOR_PORT}/invoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(LIMITS.runTimeoutMs),
      body: JSON.stringify({
        workerKey: `try:${ext.id}@${ext.version}`,
        grant: 'try',
        code,
        name: fixture.function,
        input: fixture.input,
        user: { _id: 'try-user' },
      }),
    }).catch((e: unknown) => {
      throw new Error(
        `no response within ${LIMITS.runTimeoutMs}ms: ${String(e)}`,
      );
    });

    const run = (await res.json()) as { ok: boolean };
    console.log(JSON.stringify({ ...run, writes }, null, 2));
    exitCode = run.ok ? 0 : 1;
  } finally {
    workerd.kill('SIGKILL');
    stub.close();
  }

  process.exit(exitCode);
};

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
