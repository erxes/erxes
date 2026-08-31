import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const WRANGLER = resolve(
  import.meta.dirname,
  '..',
  'node_modules',
  '.bin',
  'wrangler',
);

const RETENTION_DAYS = Number(process.env.MAIL_RETENTION_DAYS ?? 14);

const INBOUND_QUEUE = 'erxes-mail-inbound';
const DLQ = 'erxes-mail-dlq';
const BUCKET = 'erxes-mail-inbound';
const NAMESPACE = 'MAIL_ROUTES';
const LIFECYCLE_RULE = 'expire-stored-mail';

const NAMESPACE_ID = /"?id"?\s*[:=]\s*"([0-9a-f]{32})"/i;

const run = (label, args) => {
  process.stdout.write(`\n▸ ${label}\n`);

  const result = spawnSync(WRANGLER, args, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  process.stdout.write(output);

  if (result.status === 0) {
    return { ok: true, output };
  }

  if (/already exists|already taken|already been taken|duplicate/i.test(output)) {
    process.stdout.write('  (already present, leaving it alone)\n');

    return { ok: true, output, existed: true };
  }

  return { ok: false, output };
};

const steps = [
  ['Inbound queue', ['queues', 'create', INBOUND_QUEUE]],
  ['Dead-letter queue', ['queues', 'create', DLQ]],
  ['Object store', ['r2', 'bucket', 'create', BUCKET]],
  [
    `Retention rule (${RETENTION_DAYS} days)`,
    [
      'r2',
      'bucket',
      'lifecycle',
      'add',
      BUCKET,
      LIFECYCLE_RULE,
      '--expire-days',
      String(RETENTION_DAYS),
      '-y',
    ],
  ],
  ['Routing namespace', ['kv', 'namespace', 'create', NAMESPACE]],
];

const failed = [];
let namespaceOutput = '';

for (const [label, args] of steps) {
  const result = run(label, args);

  if (!result.ok) {
    failed.push(label);
  }

  if (args[0] === 'kv') {
    namespaceOutput = result.output;
  }
}

const namespaceId = NAMESPACE_ID.exec(namespaceOutput);

process.stdout.write('\n────────────────────────────────────────\n');

if (failed.length) {
  process.stdout.write(`✗ Failed: ${failed.join(', ')}\n`);
} else {
  process.stdout.write('✓ Every resource is in place\n');
}

if (namespaceId) {
  process.stdout.write(
    `\nPaste this into wrangler.toml under [[kv_namespaces]]:\n  id = "${namespaceId[1]}"\n`,
  );
} else {
  process.stdout.write(
    '\nThe namespace already existed — read its id with:\n  npx wrangler kv namespace list\n',
  );
}

process.stdout.write(
  '\nStill manual, because wrangler does not manage them:\n' +
    '  • the shared secret:  npx wrangler secret put WEBHOOK_SECRET\n' +
    '  • Email Routing: enable it on the mail zone and add a catch-all rule to this Worker\n',
);

process.exit(failed.length ? 1 : 0);
