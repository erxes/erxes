#!/usr/bin/env node
// Stages the public plugin SDK packages into dist/plugin-sdk/<pkg>:
//   @erxes/api-shared  – built erxes-api-shared (run `pnpm nx build erxes-api-shared` first)
//   @erxes/ui          – type declarations of frontend/libs/erxes-ui
//   @erxes/ui-modules  – type declarations of frontend/libs/ui-modules
//   create-erxes-plugin – tools/create-erxes-plugin (scaffolds against the above)
//
// The UI packages are types-only: at runtime plugins consume the host's
// erxes-ui / ui-modules through Module Federation shared scope.
//
// Declaration emit must run on a hoisted install
// (`pnpm install --config.node-linker=hoisted`), otherwise tsc cannot name
// transitive radix/imask types (TS2742) and skips those files.
//
// Usage: node scripts/plugin-sdk/build.mjs --version 3.1.0
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'dist/plugin-sdk');

const API_PEERS = ['mongoose', 'graphql'];
const UI_PEERS = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  '@apollo/client',
  'jotai',
  'react-i18next',
  'graphql',
];

const parseVersion = () => {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--version');
  const version = idx >= 0 ? args[idx + 1] : process.env.PLUGIN_SDK_VERSION;
  if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
    throw new Error('Pass a semver version: --version 3.1.0');
  }
  return version;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const writeJson = (file, data) =>
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

const copyDir = (from, to, filter = () => true) => {
  fs.cpSync(from, to, { recursive: true, filter });
};

const installedVersion = (pkg) => {
  const candidates = [
    path.join(ROOT, 'node_modules', pkg, 'package.json'),
    path.join(ROOT, 'node_modules/.pnpm/node_modules', pkg, 'package.json'),
  ];
  const found = candidates.find((file) => fs.existsSync(file));
  if (!found) {
    throw new Error(`Cannot resolve installed version of ${pkg}`);
  }
  return readJson(found).version;
};

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const bareImports = (dir) => {
  const specifiers = new Set();
  const re = /(?:from\s+|import\()\s*["']([^"'.][^"']*)["']/g;
  for (const file of walk(dir).filter((f) => f.endsWith('.d.ts'))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(re)) {
      const spec = match[1];
      if (spec.startsWith('node:')) continue;
      const parts = spec.split('/');
      specifiers.add(spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
    }
  }
  return [...specifiers].sort();
};

// tsc inlines deep paths that some packages only expose via a public subpath.
const DEEP_IMPORT_REWRITES = [
  ['class-variance-authority/dist/types', 'class-variance-authority/types'],
];

const rewriteDeepImports = (dir) => {
  for (const file of walk(dir).filter((f) => f.endsWith('.d.ts'))) {
    const source = fs.readFileSync(file, 'utf8');
    let next = source;
    for (const [from, to] of DEEP_IMPORT_REWRITES) {
      next = next.split(`"${from}"`).join(`"${to}"`);
    }
    if (next !== source) fs.writeFileSync(file, next);
  }
};

const buildApiShared = (version) => {
  const src = path.join(ROOT, 'backend/erxes-api-shared');
  const out = path.join(OUT, 'api-shared');
  if (!fs.existsSync(path.join(src, 'dist'))) {
    throw new Error('Run `pnpm nx build erxes-api-shared` first');
  }
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const pkg = readJson(path.join(src, 'package.json'));
  for (const entry of pkg.files) {
    copyDir(path.join(src, entry), path.join(out, entry));
  }

  const dependencies = { ...pkg.dependencies };
  const peerDependencies = {};
  for (const peer of API_PEERS) {
    peerDependencies[peer] = dependencies[peer];
    delete dependencies[peer];
  }

  writeJson(path.join(out, 'package.json'), {
    name: '@erxes/api-shared',
    version,
    description: 'erxes backend plugin SDK (startPlugin, tenancy, service discovery, shared types)',
    license: 'AGPL-3.0',
    repository: { type: 'git', url: 'https://github.com/erxes/erxes.git', directory: 'backend/erxes-api-shared' },
    main: pkg.main,
    module: pkg.module,
    types: 'dist/erxes-api-shared.cjs.d.ts',
    files: pkg.files,
    dependencies,
    peerDependencies,
    publishConfig: { access: 'public' },
  });
};

const tsc = (project) => {
  try {
    execFileSync('npx', ['tsc', '-p', project], { cwd: ROOT, stdio: 'pipe' });
  } catch (error) {
    // Pre-existing type errors in the libs do not block declaration emit;
    // only fail when an expected entry declaration is missing afterwards.
    const output = String(error.stdout || '');
    const lines = output.split('\n').filter((line) => line.includes('error TS'));
    console.warn(`${project}: ${lines.length} type errors (declarations still emitted)`);
    const nonPortable = lines.filter((line) => /TS2742|TS4023/.test(line));
    if (nonPortable.length) {
      throw new Error(
        `Non-portable declarations (TS2742: use a hoisted install; TS4023: export the named type):\n${nonPortable.join('\n')}`,
      );
    }
  }
};

const uiPackageJson = ({ name, description, dir, version, self, localDeps }) => {
  const dependencies = {};
  const peerDependencies = {};
  for (const spec of bareImports(dir)) {
    if (spec === self) continue;
    if (localDeps[spec]) {
      dependencies[spec] = localDeps[spec];
    } else if (UI_PEERS.includes(spec)) {
      peerDependencies[spec] = `^${installedVersion(spec)}`;
    } else {
      dependencies[spec] = `^${installedVersion(spec)}`;
    }
  }
  return {
    name,
    version,
    description,
    license: 'AGPL-3.0',
    repository: { type: 'git', url: 'https://github.com/erxes/erxes.git' },
    types: 'index.d.ts',
    dependencies,
    peerDependencies,
    publishConfig: { access: 'public' },
  };
};

const buildUiTypes = (version) => {
  const uiOut = path.join(OUT, 'ui');
  const modulesOut = path.join(OUT, 'ui-modules');
  fs.rmSync(uiOut, { recursive: true, force: true });
  fs.rmSync(modulesOut, { recursive: true, force: true });

  tsc('frontend/libs/erxes-ui/tsconfig.sdk-types.json');
  tsc('frontend/libs/ui-modules/tsconfig.sdk-types.json');

  for (const [dir, entry] of [
    [uiOut, 'index.d.ts'],
    [modulesOut, 'index.d.ts'],
  ]) {
    if (!fs.existsSync(path.join(dir, entry))) {
      throw new Error(`Missing ${path.join(dir, entry)}`);
    }
    rewriteDeepImports(dir);
  }

  writeJson(
    path.join(uiOut, 'package.json'),
    uiPackageJson({
      name: '@erxes/ui',
      description:
        'Type declarations for erxes-ui. Install as `"erxes-ui": "npm:@erxes/ui@^x"`; the runtime is provided by core-ui via Module Federation.',
      dir: uiOut,
      version,
      self: 'erxes-ui',
      localDeps: {},
    }),
  );

  writeJson(
    path.join(modulesOut, 'package.json'),
    uiPackageJson({
      name: '@erxes/ui-modules',
      description:
        'Type declarations for ui-modules. Install as `"ui-modules": "npm:@erxes/ui-modules@^x"`; the runtime is provided by core-ui via Module Federation.',
      dir: modulesOut,
      version,
      self: 'ui-modules',
      localDeps: { 'erxes-ui': `npm:@erxes/ui@${version}` },
    }),
  );
};

const buildCli = (version) => {
  const out = path.join(OUT, 'create-erxes-plugin');
  fs.rmSync(out, { recursive: true, force: true });
  copyDir(path.join(ROOT, 'tools/create-erxes-plugin'), out);
  const pkg = readJson(path.join(out, 'package.json'));
  writeJson(path.join(out, 'package.json'), { ...pkg, version });
};

const version = parseVersion();
buildApiShared(version);
buildUiTypes(version);
buildCli(version);
console.log(`plugin SDK ${version} staged in ${path.relative(ROOT, OUT)}`);
