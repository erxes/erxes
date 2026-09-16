const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const dockerfile = readFileSync(path.join(__dirname, '../Dockerfile'), 'utf8');
const stages = dockerfile.split(/^FROM /m).slice(1);

test('QEMU workaround is installer-only and precedes Node invocations', () => {
  assert.equal(stages.length, 2);
  const [installer, runtime] = stages;
  assert.match(installer, /^node:22-alpine3\.22 AS installer/);
  assert.match(installer, /^ENV NODE_OPTIONS=--jitless$/m);
  assert.ok(
    installer.indexOf('ENV NODE_OPTIONS=--jitless') < installer.indexOf('RUN '),
  );
  assert.doesNotMatch(runtime, /NODE_OPTIONS|jitless/);
  assert.match(runtime, /^node:22-alpine3\.22\n/);
});

test('a failed package install exits nonzero before any cleanup', () => {
  const commands = stages[0].replace(/\\\r?\n/g, '').split('\n');
  const install = commands.find(
    (line) => line.startsWith('RUN ') && line.includes('pnpm install --prod'),
  );
  assert.ok(install);
  const result = spawnSync(
    '/bin/sh',
    [
      '-c',
      [
        'node() { return 0; }',
        'pnpm() { return 23; }',
        'find() { echo cleanup-reached; return 0; }',
        install.slice(4),
      ].join('\n'),
    ],
    { encoding: 'utf8' },
  );
  assert.ifError(result.error);
  assert.equal(result.status, 23);
  assert.equal(result.stdout, '');
});
