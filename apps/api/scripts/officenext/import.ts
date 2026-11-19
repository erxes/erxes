/**
 * Copies one organisation's core data from old erxes (3.4, Mongo) into core's tables, keeping
 * the Mongo ids (erxes/erxes#10576). Plugins import their own records afterwards and resolve
 * merged ids through `officenext_import.id_map`.
 *
 *   MONGO_URL=mongodb://… DATA_URL=postgres://… ORG_ID=<core org id> \
 *     pnpm --filter @erxes/api migrate:import [--write] [--only <collection>] [--limit N]
 *
 * Without --write it is a dry run: every row is written in one transaction that is rolled back.
 * A second --write copies nothing new. The report (seen, copied, skipped with reasons, per
 * collection) is printed and saved under `--report-dir` (default `reports/`).
 */
import { MongoClient } from 'mongodb';
import { parseArgs } from 'node:util';
import { Client } from 'pg';
import { inOrder } from '~/lib/sequence';
import { say } from '../cli';
import { createIdMap, loadIdMap } from './idMap';
import { Report } from './report';
import type { Run } from './run';
import { STEPS } from './steps';

const { values: args } = parseArgs({
  options: {
    write: { type: 'boolean', default: false },
    only: { type: 'string', multiple: true },
    limit: { type: 'string' },
    'report-dir': { type: 'string', default: 'reports' },
  },
});

const { MONGO_URL, DATA_URL, ORG_ID } = process.env;

const main = async () => {
  if (!MONGO_URL || !DATA_URL || !ORG_ID) throw new Error('Set MONGO_URL, DATA_URL and ORG_ID.');

  const only = new Set(args.only ?? []);

  const steps = STEPS.filter(
    (step) => !only.size || step.collections.some((name) => only.has(name)) || only.has(step.name),
  );

  if (!steps.length) throw new Error(`No step reads ${[...only].join(', ')}`);

  const mongo = await MongoClient.connect(MONGO_URL);
  const pg = new Client({ connectionString: DATA_URL });
  const report = new Report();
  const started = new Date();

  await pg.connect();

  const run: Run = {
    mongo: mongo.db('erxes'),
    other: (name) => mongo.db(name),
    pg,
    orgId: ORG_ID,
    write: args.write,
    limit: Number(args.limit ?? 0),
    report,
  };

  try {
    await pg.query("select set_config('app.org_id', $1, false)", [ORG_ID]);
    await createIdMap(run);
    await loadIdMap(run);

    if (!run.write) await pg.query('BEGIN');

    await inOrder(steps, async (step) => {
      const at = Date.now();

      await step.run(run);
      say(`${step.name}: ${Math.round((Date.now() - at) / 1000)} s`);
    });

    if (!run.write) await pg.query('ROLLBACK');
  } finally {
    await pg.end();
    await mongo.close();
  }

  const path = `${args['report-dir']}/erxes-${started.toISOString().replaceAll(/[:.]/g, '-')}.json`;

  report.save(path, {
    write: run.write,
    started: started.toISOString(),
    finished: new Date().toISOString(),
    only: [...only],
    limit: run.limit,
  });

  for (const line of report.lines()) say(line);

  say(run.write ? `Copied. Report: ${path}` : `Dry run, nothing kept. Report: ${path}`);
};

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
