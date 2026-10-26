import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

it('resumes a native Mastra run with parallel calls through the real SDK and transport, including a chained decline', () => {
  const result = spawnSync(
    process.execPath,
    [join(__dirname, 'fixtures/approvalRoundTrip.cjs')],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 20_000,
    },
  );
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
}, 25_000);
