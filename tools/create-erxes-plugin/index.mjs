#!/usr/bin/env node
// create-erxes-plugin — scaffold a standalone erxes plugin repo.
//
// Copies ./template into a target directory and renames the `changeme`
// token family (filenames included) plus __API_PORT__/__UI_PORT__/
// __GITHUB_OWNER__ markers. Zero dependencies — prompts via readline when
// flags are missing.
//
// Token family (longest first, so no partial clobbering):
//   changemodule  → module camelCase      (points → points, orderItems → orderItems)
//   Changemodule  → module PascalCase     (OrderItems)
//   CHANGEMODULE  → module SNAKE          (ORDER_ITEMS)
//   changeme_ui   → plugin MF remote name (tourism_ex_ui)
//   changemec     → plugin camelCase      (tourismEx)  — GraphQL op prefixes etc.
//   Changeme      → plugin PascalCase     (TourismEx)  — components/classes
//   CHANGEME      → plugin SNAKE          (TOURISM_EX) — env vars
//   changeme      → plugin kebab-case     (tourism-ex) — name, services, paths

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const TEMPLATE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), 'template');

const kebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
const camel = (s) =>
  kebab(s).replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const pascal = (s) => {
  const c = camel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
};
const snake = (s) => kebab(s).replace(/-/g, '_').toUpperCase();
const remote = (s) => `${kebab(s).replace(/-/g, '_')}_ui`;

const CLI_VERSION = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'), 'utf8'),
).version;

const NAME_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/;

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [key, inline] = arg.split('=');
    const take = () => (inline !== undefined ? inline : argv[++i]);
    switch (key) {
      case '--name': case '-n': flags.name = take(); break;
      case '--module': case '-m': flags.module = take(); break;
      case '--api-port': flags.apiPort = Number(take()); break;
      case '--ui-port': flags.uiPort = Number(take()); break;
      case '--owner': case '-o': flags.owner = take(); break;
      case '--dir': case '-d': flags.dir = take(); break;
      case '--sdk-version': flags.sdkVersion = take(); break;
      case '--yes': case '-y': flags.yes = true; break;
      case '--help': case '-h': flags.help = true; break;
      default:
        if (!arg.startsWith('-') && !flags.dir) flags.dir = arg;
    }
  }
  return flags;
}

const HELP = `Usage: create-erxes-plugin [dir] [options]

Options:
  --name, -n     plugin name (e.g. loyalty, tourismEx)   [prompt]
  --module, -m   first module name (e.g. points)         [prompt]
  --api-port     <name>_api port (default 3401)
  --ui-port      <name>_ui dev-server port (default 4101)
  --owner, -o    GitHub owner for ghcr image + Pages URL [prompt]
  --dir, -d      target directory (default ./<name>-plugin)
  --sdk-version  @erxes/api-shared, @erxes/ui, @erxes/ui-modules range
                 (default ^<this CLI's version>)
  --yes, -y      accept defaults for anything missing
`;

async function ask(rl, label, def) {
  return new Promise((res) =>
    rl.question(`${label}${def ? ` (${def})` : ''}: `, (a) => res(a.trim() || def)),
  );
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const tokenMap = (pluginName, moduleName, apiPort, uiPort, owner, sdkVersion) => [
  [/changemodule/g, camel(moduleName)],
  [/Changemodule/g, pascal(moduleName)],
  [/CHANGEMODULE/g, snake(moduleName)],
  [/changeme_ui/g, remote(pluginName)],
  [/changemec/g, camel(pluginName)],
  [/Changeme/g, pascal(pluginName)],
  [/CHANGEME/g, snake(pluginName)],
  [/changeme/g, kebab(pluginName)],
  [/__API_PORT__/g, String(apiPort)],
  [/__UI_PORT__/g, String(uiPort)],
  [/__GITHUB_OWNER__/g, owner],
  [/__ERXES_SDK_VERSION__/g, sdkVersion],
];

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help) {
    console.log(HELP);
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const interactive = !flags.yes;

  const name = flags.name ?? (interactive ? await ask(rl, 'Plugin name') : undefined);
  const module = flags.module ?? (interactive ? await ask(rl, 'First module name', 'items') : 'items');
  const owner = flags.owner ?? (interactive ? await ask(rl, 'GitHub owner (ghcr + Pages)') : 'changemeowner');
  const apiPort = flags.apiPort || 3401;
  const uiPort = flags.uiPort || 4101;
  const sdkVersion = flags.sdkVersion || `^${CLI_VERSION}`;
  rl.close();

  for (const [label, value] of [['Plugin', name], ['Module', module]]) {
    if (!value || !NAME_RE.test(value)) {
      console.error(`${label} name must start with a letter, letters/numbers/dashes only — got "${value}"`);
      process.exit(1);
    }
  }

  const pluginName = kebab(name);
  const moduleName = kebab(module);
  const target = resolve(flags.dir || `${pluginName}-plugin`);

  if (existsSync(target) && readdirSync(target).length > 0) {
    console.error(`Target directory is not empty: ${target}`);
    process.exit(1);
  }

  mkdirSync(target, { recursive: true });
  cpSync(TEMPLATE_DIR, target, { recursive: true });
  // npm strips .gitignore from published tarballs, so the template ships it as _gitignore.
  renameSync(join(target, '_gitignore'), join(target, '.gitignore'));

  const replacements = tokenMap(pluginName, moduleName, apiPort, uiPort, owner, sdkVersion);

  const renameQueue = [];
  for (const file of walk(target)) {
    const content = readFileSync(file, 'utf8');
    let next = content;
    for (const [re, value] of replacements) next = next.replace(re, value);
    if (next !== content) writeFileSync(file, next);
    renameQueue.push(file);
  }

  // Rename file/dir names containing tokens — deepest first so parents move last.
  const renamePath = (p) => {
    const dir = dirname(p);
    const base = basename(p);
    let next = base;
    for (const [re, value] of replacements) next = next.replace(re, value);
    if (next !== base && existsSync(p)) renameSync(p, join(dir, next));
  };

  const allPaths = [...walk(target)].map(String);
  // Files first (deepest), then directories (deepest).
  for (const p of allPaths.sort((a, b) => b.length - a.length)) renamePath(p);
  const dirs = [];
  const collectDirs = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        collectDirs(p);
        dirs.push(p);
      }
    }
  };
  collectDirs(target);
  for (const p of dirs.sort((a, b) => b.length - a.length)) renamePath(p);

  console.log(`
Created ${pluginName} plugin at ${target}

Next:
  cd ${basename(target)}
  pnpm --dir api install && pnpm --dir ui install
  docker compose up -d          # mongo + redis + ${pluginName}_api on :${apiPort}
  pnpm --dir ui dev             # ${remote(pluginName)} remoteEntry.js on :${uiPort}

Then on your erxes deployment:
  ENABLED_PLUGINS=${pluginName}           # env path, or
  Marketplace -> Add plugin -> this repo's GitHub URL

Contract: https://github.com/erxes/erxes/blob/main/docs/plugins/contract.md
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
