import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

it('verifies orphan, ownership, suspension and lease behavior with the native Mastra runtime', () => {
  const result = spawnSync(
    process.execPath,
    ['--test', join(__dirname, 'fixtures/runLiveness.mjs')],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 15_000,
    },
  );
  expect(result.error).toBeUndefined();
  if (result.status !== 0)
    throw new Error(
      result.stdout + result.stderr || 'Native liveness checks failed',
    );
}, 20_000);
