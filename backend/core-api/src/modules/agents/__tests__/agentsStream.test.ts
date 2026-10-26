import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

it('keeps quiet streams alive and ends them with the restart error on shutdown, with the native Mastra runtime', () => {
  const result = spawnSync(
    process.execPath,
    ['--test', join(__dirname, 'fixtures/agentsStream.mjs')],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 15_000,
    },
  );
  expect(result.error).toBeUndefined();
  if (result.status !== 0)
    throw new Error(
      result.stdout + result.stderr || 'Native agents stream checks failed',
    );
}, 20_000);
