// Typechecks an extension's server and UI in one program, from its
// tsconfig.json. erxes-ui's own source carries type errors the extension
// can't fix, so whole diagnostics located in frontend/libs are dropped; the
// rest are printed and fail the check.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TSC = require.resolve('typescript/bin/tsc');

export const check = (extDir: string) => {
  const tsc = spawnSync(
    process.execPath,
    [
      TSC,
      '-p',
      path.join(extDir, 'tsconfig.json'),
      '--noEmit',
      '--pretty',
      'false',
    ],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    },
  );

  if (tsc.error) {
    throw new Error(`could not run tsc: ${tsc.error.message}`);
  }

  // A diagnostic starts at column 0 with `file(line,col): error`; its wrapped
  // lines are indented.
  const all = tsc.stdout.split('\n').reduce<string[][]>((all, line) => {
    if (/^\S/.test(line)) all.push([line]);
    else if (line.trim() && all.length > 0) all[all.length - 1].push(line);
    return all;
  }, []);
  const diagnostics = all.filter(
    ([first]) => !first.includes('frontend/libs/'),
  );

  // tsc failed without printing a diagnostic (a crash, out of memory): the
  // check never ran, so it can't pass.
  if (tsc.status !== 0 && all.length === 0) {
    throw new Error(tsc.stderr || `tsc exited with ${tsc.status}`);
  }

  if (diagnostics.length > 0) {
    throw new Error(
      `${diagnostics.map((lines) => lines.join('\n')).join('\n')}\n\n${
        diagnostics.length
      } error(s) in the extension`,
    );
  }
};
