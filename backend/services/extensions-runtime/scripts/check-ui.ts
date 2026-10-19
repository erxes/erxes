// Typechecks an extension's UI. erxes-ui's own source carries type errors the
// extension can't fix, so whole diagnostics located in frontend/libs are
// dropped; the rest are printed and fail the check.
//
//   npx tsx scripts/check-ui.ts <extDir>
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const [extDir] = process.argv.slice(2);

if (!extDir) {
  console.error('usage: check-ui.ts <extDir>');
  process.exit(1);
}

const tsc = spawnSync(
  'npx',
  [
    'tsc',
    '-p',
    path.join(extDir, 'ui/tsconfig.json'),
    '--noEmit',
    '--pretty',
    'false',
  ],
  { encoding: 'utf8' },
);

// A diagnostic starts at column 0 with `file(line,col): error`; its wrapped
// lines are indented.
const diagnostics = tsc.stdout
  .split('\n')
  .reduce<string[][]>((all, line) => {
    if (/^\S/.test(line)) all.push([line]);
    else if (line.trim() && all.length > 0) all[all.length - 1].push(line);
    return all;
  }, [])
  .filter(([first]) => !first.includes('frontend/libs/'));

if (diagnostics.length > 0) {
  console.log(diagnostics.map((lines) => lines.join('\n')).join('\n'));
  console.log(`\n${diagnostics.length} error(s) in the extension's UI`);
  process.exit(1);
}

console.log('UI typecheck clean');
