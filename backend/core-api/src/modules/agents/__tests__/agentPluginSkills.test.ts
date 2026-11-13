import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// The base agent runs on the real installed ESM Mastra runtime, which jest's
// CommonJS loader cannot host; the fixture bundles the real module sources.
it('mounts plugin skills on the real base agent', () => {
  const result = spawnSync(
    process.execPath,
    ['--test', join(__dirname, 'fixtures/pluginSkills.mjs')],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 30_000,
    },
  );

  expect(result.error).toBeUndefined();
  if (result.status !== 0) {
    throw new Error(
      result.stdout + result.stderr || 'Plugin skill checks failed',
    );
  }
}, 40_000);
