import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

it('reports a reply lost to a server restart and lets Retry answer again, through the real SDK and transport', () => {
  const result = spawnSync(
    process.execPath,
    [join(__dirname, 'fixtures/serverRestart.cjs')],
    { cwd: tmpdir(), encoding: 'utf8', timeout: 20_000 },
  );
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
}, 25_000);
