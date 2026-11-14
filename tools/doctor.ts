/**
 * Checks this machine can run the repo: Docker, Node and pnpm against `engines`, free
 * disk, and the ports `vp run dev:stack up` would use. One line per problem, with the fix.
 *   vp run doctor
 */
import { execFileSync } from 'node:child_process';
import { statfsSync } from 'node:fs';
import { createServer } from 'node:net';
import { satisfies } from 'semver';
import pkg from '../package.json' with { type: 'json' };
import { isUp, stack } from './dev-stack.ts';

const MIN_FREE_GB = 5;

const output = (command: string, args: string[]) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return undefined;
  }
};

const portFree = (port: number) =>
  new Promise<boolean>((done) => {
    const server = createServer()
      .once('error', () => done(false))
      .listen(port, '127.0.0.1', () => server.close(() => done(true)));
  });

const docker = () =>
  output('docker', ['info', '--format', '{{.ServerVersion}}'])
    ? []
    : [
        'Docker: the daemon does not answer. Start Docker, or join the docker group (sudo usermod -aG docker $USER, then sign in again).',
      ];

const versions = () => {
  const pnpm = output('pnpm', ['--version'])?.trim();

  return [
    satisfies(process.versions.node, pkg.engines.node)
      ? undefined
      : `Node ${process.versions.node} does not satisfy ${pkg.engines.node}. Install the version in .node-version.`,
    pnpm && satisfies(pnpm, pkg.engines.pnpm)
      ? undefined
      : `pnpm ${pnpm ?? 'is missing'}, the repo needs ${pkg.engines.pnpm}. Run: corepack enable && corepack install (installs ${pkg.packageManager}).`,
  ].filter((problem) => problem !== undefined);
};

const disk = () => {
  const { bavail, bsize } = statfsSync(import.meta.dirname);
  const freeGb = (bavail * bsize) / 1024 ** 3;

  return freeGb >= MIN_FREE_GB
    ? []
    : [
        `Disk: ${freeGb.toFixed(1)} GB free, the install, builds and Postgres need ${MIN_FREE_GB} GB. Run pnpm store prune, or remove checkouts you are done with.`,
      ];
};

const ports = async () => {
  if (isUp()) return [];

  const checked = await Promise.all(
    Object.entries(stack.ports).map(async ([name, port]) => ({
      name,
      port,
      free: await portFree(port),
    })),
  );

  return checked
    .filter(({ free }) => !free)
    .map(
      ({ name, port }) =>
        `Port ${port} (dev:stack ${name}) is in use. Find what holds it with: ss -ltnp 'sport = :${port}'`,
    );
};

const problems = [...docker(), ...versions(), ...disk(), ...(await ports())];

for (const problem of problems) process.stdout.write(`${problem}\n`);

process.stdout.write(
  problems.length ? `doctor: ${problems.length} problem(s)\n` : 'doctor: all good\n',
);

process.exitCode = problems.length ? 1 : 0;
