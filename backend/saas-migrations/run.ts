/**
 * Unified migration runner.
 *
 * Discovers every migration script under backend/migrations/<domain>/*.ts and
 * runs each one in its own child process (`node --import tsx`). A child process
 * is required because the scripts self-invoke and call `process.exit()` when
 * they finish — running them in-process would tear down the runner after the
 * first script.
 *
 * Usage (from anywhere; env/.env is resolved by each script's own dotenv):
 *   tsx backend/migrations/run.ts                 # run everything
 *   tsx backend/migrations/run.ts core frontline  # only these domains
 *   tsx backend/migrations/run.ts core/migratePost.ts   # a single script
 *   tsx backend/migrations/run.ts --list          # show what would run, run nothing
 *   tsx backend/migrations/run.ts --continue      # don't stop on the first failure
 *
 * Exit code is non-zero if any migration fails.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MIGRATIONS_DIR = __dirname;

// Domains run in this order first (others follow, alphabetically). Core data is
// migrated before plugin data that may reference it.
const DOMAIN_ORDER = ['core'];

type Target = { domain: string; file: string; abs: string; rel: string };

function discover(): Target[] {
  const targets: Target[] = [];
  for (const domain of readdirSync(MIGRATIONS_DIR)) {
    const domainDir = join(MIGRATIONS_DIR, domain);
    if (!statSync(domainDir).isDirectory()) continue;
    for (const file of readdirSync(domainDir)) {
      if (!file.endsWith('.ts')) continue;
      if (file.startsWith('_') || file.startsWith('.')) continue; // templates/helpers

      const abs = join(domainDir, file);
      targets.push({
        domain,
        file,
        abs,
        rel: relative(MIGRATIONS_DIR, abs),
      });
    }
  }
  return targets.sort((a, b) => {
    const ai = DOMAIN_ORDER.indexOf(a.domain);
    const bi = DOMAIN_ORDER.indexOf(b.domain);
    const ar = ai === -1 ? DOMAIN_ORDER.length : ai;
    const br = bi === -1 ? DOMAIN_ORDER.length : bi;
    if (ar !== br) return ar - br;
    if (a.domain !== b.domain) return a.domain.localeCompare(b.domain);
    return a.file.localeCompare(b.file);
  });
}

function matches(target: Target, filters: string[]): boolean {
  if (filters.length === 0) return true;
  return filters.some((f) => {
    const norm = f.replace(/\\/g, '/').replace(/\.ts$/, '');
    return (
      target.domain === norm || // domain name
      target.rel.replace(/\.ts$/, '') === norm || // domain/file
      target.file.replace(/\.ts$/, '') === norm // bare file name
    );
  });
}

function main(): void {
  const args = process.argv.slice(2);
  const listOnly = args.includes('--list') || args.includes('--dry-run');
  const keepGoing = args.includes('--continue');
  const filters = args.filter((a) => !a.startsWith('--'));

  const all = discover();
  const targets = all.filter((t) => matches(t, filters));

  if (filters.length && targets.length === 0) {
    console.error(`No migrations matched: ${filters.join(', ')}`);
    console.error(`Available:\n  ${all.map((t) => t.rel).join('\n  ')}`);
    process.exit(1);
  }

  console.log(`Found ${targets.length} migration(s) to run:`);
  for (const t of targets) console.log(`  • ${t.rel}`);
  if (listOnly) return;
  console.log('');

  const results: { rel: string; ok: boolean }[] = [];
  for (const t of targets) {
    console.log('═'.repeat(60));
    console.log(`▶ ${t.rel}`);
    console.log('═'.repeat(60));
    const res = spawnSync(process.execPath, ['--import', 'tsx', t.abs], {
      stdio: 'inherit',
      env: process.env,
    });
    const ok = res.status === 0 && !res.error;
    results.push({ rel: t.rel, ok });
    if (!ok) {
      console.error(
        `\n✖ FAILED: ${t.rel}` +
          (res.error ? ` (${res.error.message})` : ` (exit ${res.status})`),
      );
      if (!keepGoing) {
        summarize(results, targets.length);
        process.exit(1);
      }
    } else {
      console.log(`\n✔ OK: ${t.rel}`);
    }
  }

  summarize(results, targets.length);
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

function summarize(
  results: { rel: string; ok: boolean }[],
  total: number,
): void {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log('\n' + '═'.repeat(60));
  console.log(
    `Summary: ${passed}/${total} succeeded, ${failed.length} failed, ${total - results.length} not run`,
  );
  for (const f of failed) console.log(`  ✖ ${f.rel}`);
  console.log('═'.repeat(60));
}

main();
