// scripts/publish-shared-libs.js
// Publishes the three in-repo shared libraries to npm under scoped names,
// keeping their in-repo package names and sources untouched:
//
//   backend/erxes-api-shared  (erxes-api-shared)  -> @erxes/api-shared
//   frontend/libs/erxes-ui    (erxes-ui)          -> @erxes/ui
//   frontend/libs/ui-modules  (ui-modules)        -> @erxes/ui-modules
//
// External plugins consume them through npm aliases, e.g.
//   "erxes-ui": "npm:@erxes/ui@3.2.14-1"
//
// Versions are lockstep: <root package.json version>-N, where N is one more
// than the highest N already published for any of the three packages
// (3.2.14-1, 3.2.14-2, ...).
//
// Usage:
//   pnpm publish:shared-libs --dry-run [--otp=<code>]
//   pnpm publish:shared-libs [--otp=<code>]

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORK_DIR = path.join(ROOT, 'tmp', 'shared-libs-publish');
const STAGED_DIR = path.join(WORK_DIR, 'staged');
const PACK_DIR = path.join(WORK_DIR, 'pack');

const DRY_RUN = process.argv.includes('--dry-run');
const OTP = (process.argv.find((arg) => arg.startsWith('--otp=')) || '').slice(
  '--otp='.length,
);

const LIBS = [
  {
    dir: 'backend/erxes-api-shared',
    name: 'erxes-api-shared',
    npmName: '@erxes/api-shared',
    build: () => run('pnpm', ['nx', 'build', 'erxes-api-shared'], { cwd: ROOT }),
    buildCheck: (libDir) =>
      path.join(libDir, 'dist', 'erxes-api-shared.cjs.js'),
  },
  {
    dir: 'frontend/libs/erxes-ui',
    name: 'erxes-ui',
    npmName: '@erxes/ui',
    build: () =>
      run('pnpm', ['--filter', 'erxes-ui', 'run', 'build:dts'], {
        cwd: ROOT,
        tolerateFailure: true,
      }),
    buildCheck: (libDir) => path.join(libDir, 'dist', 'index.d.ts'),
  },
  {
    dir: 'frontend/libs/ui-modules',
    name: 'ui-modules',
    npmName: '@erxes/ui-modules',
    build: () =>
      run('pnpm', ['--filter', 'ui-modules', 'run', 'build:dts'], {
        cwd: ROOT,
        tolerateFailure: true,
      }),
    buildCheck: (libDir) => path.join(libDir, 'dist', 'index.d.ts'),
  },
];

function run(command, args, options = {}) {
  const printable = `${command} ${args.join(' ')}`;
  console.log(`$ ${printable}`);
  try {
    return execFileSync(command, args, {
      cwd: options.cwd || ROOT,
      stdio: options.capture ? 'pipe' : 'inherit',
      env: process.env,
    });
  } catch (error) {
    if (options.tolerateFailure) {
      return null;
    }
    error.command = printable;
    throw error;
  }
}

function publishedVersions(npmName) {
  try {
    const output = execFileSync(
      'npm',
      ['view', npmName, 'versions', '--json'],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
    ).toString();
    const parsed = JSON.parse(output.trim() || '[]');
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    const text = `${error.stdout || ''}${error.stderr || ''}${error.message}`;
    if (text.includes('E404')) {
      return [];
    }
    throw new Error(
      `Failed to query published versions of ${npmName}: ${text.trim()}`,
    );
  }
}

function computePublishVersion() {
  const baseVersion = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
  ).version;
  const lockstepPattern = new RegExp(
    `^${baseVersion.replace(/\./g, '\\.')}-(\\d+)$`,
  );

  let maxN = 0;
  for (const lib of LIBS) {
    const versions = publishedVersions(lib.npmName);
    for (const version of versions) {
      const match = lockstepPattern.exec(version);
      if (match) {
        maxN = Math.max(maxN, Number(match[1]));
      }
    }
    console.log(
      `${lib.npmName}: ${versions.length} published version(s), ` +
        `${versions.filter((v) => lockstepPattern.test(v)).length} matching ${baseVersion}-N`,
    );
  }

  return `${baseVersion}-${maxN + 1}`;
}

function stageLib(lib, publishVersion) {
  const libDir = path.join(ROOT, lib.dir);
  fs.rmSync(PACK_DIR, { recursive: true, force: true });
  fs.mkdirSync(PACK_DIR, { recursive: true });

  // `pnpm pack` resolves workspace: specifiers into real versions.
  run('pnpm', ['pack', '--pack-destination', PACK_DIR], { cwd: libDir });
  const tarball = fs
    .readdirSync(PACK_DIR)
    .find((file) => file.endsWith('.tgz'));
  if (!tarball) {
    throw new Error(`pnpm pack produced no tarball in ${PACK_DIR}`);
  }

  const extractDir = path.join(STAGED_DIR, lib.dir);
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  run('tar', ['-xzf', path.join(PACK_DIR, tarball), '-C', extractDir]);
  const stagedDir = path.join(extractDir, 'package');
  if (!fs.existsSync(path.join(stagedDir, 'package.json'))) {
    throw new Error(`Unexpected tarball layout for ${lib.name}`);
  }

  const pkgPath = path.join(stagedDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = lib.npmName;
  pkg.version = publishVersion;
  if (pkg.peerDependencies && 'erxes-ui' in pkg.peerDependencies) {
    pkg.peerDependencies['erxes-ui'] = publishVersion;
  }
  delete pkg.devDependencies;
  delete pkg.scripts;
  pkg.publishConfig = { ...(pkg.publishConfig || {}), access: 'public' };
  pkg.repository = {
    type: 'git',
    url: 'git+https://github.com/erxes/erxes.git',
    directory: lib.dir,
  };
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  console.log(`staged ${lib.npmName}@${publishVersion} at ${stagedDir}`);
  return stagedDir;
}

const published = [];

function main() {
  console.log(`mode: ${DRY_RUN ? 'dry-run' : 'publish'}`);

  const publishVersion = computePublishVersion();
  console.log(`publish version: ${publishVersion}`);

  fs.mkdirSync(WORK_DIR, { recursive: true });

  for (const lib of LIBS) {
    fs.rmSync(path.join(ROOT, lib.dir, 'dist'), {
      recursive: true,
      force: true,
    });
    lib.build();
    const expectedOutput = lib.buildCheck(path.join(ROOT, lib.dir));
    if (!fs.existsSync(expectedOutput)) {
      throw new Error(
        `Build of ${lib.name} did not produce ${expectedOutput}`,
      );
    }
  }

  const staged = LIBS.map((lib) => ({
    lib,
    stagedDir: stageLib(lib, publishVersion),
  }));
  fs.rmSync(PACK_DIR, { recursive: true, force: true });

  for (const { lib, stagedDir } of staged) {
    const args = ['publish', stagedDir, '--tag', 'latest', '--access', 'public'];
    if (DRY_RUN) {
      args.push('--dry-run');
    }
    if (OTP) {
      args.push(`--otp=${OTP}`);
    }
    run('npm', args);
    published.push(`${lib.npmName}@${publishVersion}`);

    if (DRY_RUN) {
      run('npm', ['pack', stagedDir, '--pack-destination', WORK_DIR]);
    }
  }

  if (DRY_RUN) {
    const tarballs = fs
      .readdirSync(WORK_DIR)
      .filter((file) => file.endsWith('.tgz'))
      .map((file) => path.join(WORK_DIR, file));
    console.log('\ndry-run tarballs:');
    for (const tarball of tarballs) {
      console.log(`  ${tarball}`);
    }
    console.log(`staged dirs kept under ${STAGED_DIR}`);
  } else {
    console.log(`\npublished: ${published.join(', ')}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`\npublish-shared-libs failed: ${error.message}`);
  if (published.length) {
    console.error(`already published: ${published.join(', ')}`);
  } else {
    console.error('no packages were published');
  }
  process.exit(1);
}
