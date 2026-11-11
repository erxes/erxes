// Inventory of the old erxes codebase: modules, plugins, inter-plugin tRPC
// calls, event helpers, ui-modules imports and worker files. It reads git
// objects only (rev-parse, ls-tree, cat-file), never the working tree, and
// writes code metadata (paths, names, counts) to docs/inventory/old-erxes.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { Lang, parse } from '@ast-grep/napi';
import type { SgNode } from '@ast-grep/napi';

const argv = process.argv.slice(2);

const { values: args } = parseArgs({
  // `pnpm inventory -- …` passes the `--` through, and parseArgs reads
  // everything after a `--` as positionals.
  args: argv[0] === '--' ? argv.slice(1) : argv,
  options: {
    repo: { type: 'string' },
    ref: { type: 'string', default: 'origin/main' },
  },
});

if (!args.repo) {
  throw new Error('Usage: pnpm inventory -- --repo <old erxes checkout> [--ref origin/main]');
}

const repo = args.repo;

const output = resolve(import.meta.dirname, '../../docs/inventory/old-erxes.json');
const sourceFile = /^(backend|frontend)\/.+\.(ts|tsx|js|jsx|mts|cts|mjs|cjs)$/;

// `jobs/` is left out: in old erxes it only holds accounting's manufacturing jobs.
const workerDir = /^(workers?|crons?)$/i;
const workerName = /^(worker|cron)|(workers?|crons?)$/i;
const testFile = /\/__tests__\/|\.(test|spec)\.\w+$/;
const eventHelper = /^(sendDbEventLog|sendEvent|sendAutomation\w*)$/;
const started = performance.now();

// Calls and constructors that register a queue worker or a schedule.
const workerApis = new Set([
  'new Worker',
  'new CronJob',
  'createWorker',
  'createMQWorkerWithListeners',
  'upsertJobScheduler',
  'cron.schedule',
  'scheduleJob',
  'agenda.define',
]);

type Field = string | { dynamic: string } | { missing: true };

function git(...gitArgs: string[]) {
  return execFileSync('git', ['-C', repo, ...gitArgs], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
  });
}

/** Reads every blob in one `git cat-file --batch` process. */
function readBlobs(sha: string, paths: string[]) {
  const result = spawnSync('git', ['-C', repo, 'cat-file', '--batch'], {
    input: paths.map((path) => `${sha}:${path}\n`).join(''),
    maxBuffer: 1 << 30,
  });

  if (result.status !== 0) throw new Error(`git cat-file failed: ${result.stderr.toString()}`);

  const out = result.stdout;
  const blobs = new Map<string, string>();
  let offset = 0;

  for (const path of paths) {
    const headerEnd = out.indexOf(10, offset);
    const [, type, size] = out.subarray(offset, headerEnd).toString().split(' ');

    if (type !== 'blob') throw new Error(`${path} is not a blob (${type})`);

    const start = headerEnd + 1;

    blobs.set(path, out.subarray(start, start + Number(size)).toString('utf8'));
    offset = start + Number(size) + 1;
  }

  return blobs;
}

/** The package a file belongs to: plugin name, `core`, or the package directory. */
function packageOf(path: string) {
  const [side, group, name = ''] = path.split('/');
  const plugin = /^(\w+)_(api|ui)$/.exec(name);

  if (group === 'core-api' || group === 'core-ui') return 'core';

  if (group === 'plugins' && plugin?.[1]) return plugin[1];

  if (group === 'services' || group === 'libs') return name;

  return group ?? side ?? path;
}

function sourceText(node: SgNode) {
  return node.text().replaceAll(/\s+/g, ' ');
}

function unwrap(node: SgNode): SgNode {
  const wrapped = ['parenthesized_expression', 'as_expression', 'satisfies_expression'];
  const inner = node.namedChildren()[0];

  return inner && wrapped.some((kind) => node.is(kind)) ? unwrap(inner) : node;
}

/** The value of a string literal or a template without substitutions. */
function literal(node: SgNode) {
  if (node.kind() === 'string') return node.text().slice(1, -1);

  if (node.kind() === 'template_string' && !node.has({ rule: { kind: 'template_substitution' } }))
    return node.text().slice(1, -1);

  return undefined;
}

function field(object: SgNode, key: string): Field | undefined {
  const spreads: string[] = [];

  for (const member of object.namedChildren()) {
    const name = member.field('key');
    const value = member.field('value');

    if (member.kind() === 'pair' && name && value) {
      if ((literal(name) ?? name.text()) === key)
        return literal(unwrap(value)) ?? { dynamic: sourceText(value) };
    } else if (member.kind() === 'shorthand_property_identifier' && member.text() === key) {
      return { dynamic: key };
    } else if (member.kind() === 'spread_element') {
      spreads.push(sourceText(member));
    }
  }

  return spreads.length > 0 ? { dynamic: spreads.join(', ') } : undefined;
}

/** `foo(...)` is `foo`, `a.b.foo(...)` is `foo`, `cron.schedule(...)` is `cron.schedule`. */
function calleeName(call: SgNode) {
  const callee = call.field('function') ?? call.field('constructor');
  const property = callee?.field('property');

  if (!callee) return '';

  if (callee.kind() === 'identifier') return callee.text();

  if (!property) return sourceText(callee);

  const object = callee.field('object');

  return object?.kind() === 'identifier' && workerApis.has(`${object.text()}.${property.text()}`)
    ? `${object.text()}.${property.text()}`
    : property.text();
}

function firstArgument(call: SgNode) {
  const first = call.field('arguments')?.namedChildren()[0];

  return first ? unwrap(first) : undefined;
}

function scanFile(file: string, source: string) {
  const root = parse(file.endsWith('x') ? Lang.Tsx : Lang.TypeScript, source).root();
  const caller = packageOf(file);
  const trpcNames = new Set(['sendTRPCMessage']);
  const uiImports: { file: string; names: string[] }[] = [];
  const workerEvidence = new Set<string>();

  for (const statement of root.findAll({ rule: { kind: 'import_statement' } })) {
    const from = literal(statement.field('source') ?? statement);
    const clause = statement.find({ rule: { kind: 'import_clause' } });
    const names: string[] = [];

    for (const part of clause?.namedChildren() ?? []) {
      if (part.kind() === 'identifier') names.push('default');

      if (part.kind() === 'namespace_import') names.push('*');

      for (const specifier of part.findAll({ rule: { kind: 'import_specifier' } })) {
        const name = specifier.field('name')?.text() ?? '';
        const alias = specifier.field('alias')?.text();

        names.push(name);

        if (name === 'sendTRPCMessage' && alias) trpcNames.add(alias);
      }
    }

    if (from === 'ui-modules' || from?.startsWith('ui-modules/')) uiImports.push({ file, names });
  }

  const trpcCalls = [];
  const eventCalls = [];

  for (const call of root.findAll({
    rule: { any: [{ kind: 'call_expression' }, { kind: 'new_expression' }] },
  })) {
    const name = call.kind() === 'new_expression' ? `new ${calleeName(call)}` : calleeName(call);
    const line = call.range().start.line + 1;
    const arg = firstArgument(call);
    const object = arg?.kind() === 'object' ? arg : undefined;

    if (workerApis.has(name)) workerEvidence.add(name);

    if (trpcNames.has(name)) {
      if (!object) {
        trpcCalls.push({ file, line, caller, dynamic: arg ? sourceText(arg) : '<no argument>' });
        continue;
      }

      const method = field(object, 'method');
      const missing = { missing: true } as const;

      trpcCalls.push({
        file,
        line,
        caller,
        pluginName: field(object, 'pluginName') ?? missing,
        module: field(object, 'module') ?? missing,
        action: field(object, 'action') ?? missing,
        ...(method && { method }),
      });
    }

    if (eventHelper.test(name)) {
      const type = object && field(object, 'type');
      const action = object && field(object, 'action');

      eventCalls.push({
        file,
        line,
        caller,
        helper: name,
        ...(type && { type }),
        ...(action && { action }),
      });
    }
  }

  const segments = file.split('/');
  const stem = (segments.at(-1) ?? '').replace(/\.[^.]+$/, '');

  const workerPath =
    segments.slice(0, -1).some((segment) => workerDir.test(segment)) || workerName.test(stem);

  if (workerPath && !testFile.test(file)) workerEvidence.add('path');

  return { trpcCalls, eventCalls, uiImports, workerEvidence: [...workerEvidence].toSorted() };
}

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();

  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);

  return Object.fromEntries([...counts].toSorted(([a], [b]) => a.localeCompare(b)));
}

const sha = git('rev-parse', '--verify', `${args.ref}^{commit}`).trim();
const paths = git('ls-tree', '-r', '-z', '--name-only', sha).split('\0').filter(Boolean).toSorted();

const directoriesUnder = (prefix: RegExp) =>
  [...new Set(paths.flatMap((path) => prefix.exec(path)?.[1] ?? []))].toSorted();

const coreModules = directoriesUnder(/^backend\/core-api\/src\/modules\/([^/]+)\//);
const backendPlugins = directoriesUnder(/^backend\/plugins\/(\w+)_api\//);
const frontendPlugins = directoriesUnder(/^frontend\/plugins\/(\w+)_ui\//);
const services = directoriesUnder(/^backend\/services\/([^/]+)\//);

const plugins = [...new Set([...backendPlugins, ...frontendPlugins])].toSorted().map((name) => ({
  name,
  backend: backendPlugins.includes(name),
  frontend: frontendPlugins.includes(name),
}));

const sources = paths.filter((path) => sourceFile.test(path));
const blobs = readBlobs(sha, sources);
const scans = sources.map((file) => scanFile(file, blobs.get(file) ?? ''));
const trpcCalls = scans.flatMap((scan) => scan.trpcCalls);
const eventCalls = scans.flatMap((scan) => scan.eventCalls);

const workerFiles = sources.flatMap((file, index) => {
  const evidence = scans[index]?.workerEvidence ?? [];

  return evidence.length > 0 ? [{ file, evidence }] : [];
});

const uiImports = scans
  .flatMap((scan) => scan.uiImports)
  .filter((entry) => /^frontend\/(plugins\/\w+_ui|core-ui)\//.test(entry.file));

const uiModules = Object.entries(Object.groupBy(uiImports, (entry) => packageOf(entry.file)))
  .toSorted(([a], [b]) => a.localeCompare(b))
  .map(([plugin, imports = []]) => {
    const names = imports.flatMap((entry) => [...new Set(entry.names)]);

    return {
      plugin,
      files: new Set(imports.map((entry) => entry.file)).size,
      importStatements: imports.length,
      specifiers: imports.reduce((total, entry) => total + entry.names.length, 0),
      symbols: countBy(names, (name) => name),
    };
  });

const isDynamic = (value: Field) => typeof value !== 'string';

/** The literal `pluginName` a call targets, undefined when it is dynamic. */
function targetOf(call: (typeof trpcCalls)[number]) {
  return 'pluginName' in call && typeof call.pluginName === 'string' ? call.pluginName : undefined;
}

// Calls between two packages other than core, services included.
const pluginToPlugin = trpcCalls.flatMap((call) => {
  const target = targetOf(call);

  return target && target !== 'core' && call.caller !== 'core' && target !== call.caller
    ? [`${call.caller} -> ${target}`]
    : [];
});

// Targets with no plugin or service of that name in the tree.
const packages = new Set(['core', ...backendPlugins, ...services]);

const unknownTargets = [...new Set(trpcCalls.flatMap((call) => targetOf(call) ?? []))].filter(
  (target) => !packages.has(target),
);

const inventory = {
  repo: 'erxes/erxes',
  ref: args.ref,
  sha,
  counts: {
    coreModules: coreModules.length,
    plugins: plugins.length,
    backendPlugins: backendPlugins.length,
    frontendPlugins: frontendPlugins.length,
    services: services.length,
    sourceFiles: sources.length,
    trpcCalls: trpcCalls.length,
    trpcDynamicCalls: trpcCalls.filter(
      (call) =>
        !('pluginName' in call) ||
        [call.pluginName, call.module, call.action].some((value) => isDynamic(value)),
    ).length,
    trpcDynamicTargets: trpcCalls.filter((call) => !targetOf(call)).length,
    trpcCallsByCaller: countBy(trpcCalls, (call) => call.caller),
    trpcCallsByTarget: countBy(trpcCalls, (call) => targetOf(call) ?? '<dynamic>'),
    trpcUnknownTargets: unknownTargets.toSorted(),
    pluginToPluginCalls: pluginToPlugin.length,
    pluginToPluginEdges: countBy(pluginToPlugin, (edge) => edge),
    eventHelperCalls: eventCalls.length,
    eventHelperCallsByHelper: countBy(eventCalls, (call) => call.helper),
    uiModulesFiles: new Set(uiImports.map((entry) => entry.file)).size,
    uiModulesImportStatements: uiImports.length,
    uiModulesSpecifiers: uiModules.reduce((total, entry) => total + entry.specifiers, 0),
    uiModulesSymbols: new Set(uiImports.flatMap((entry) => entry.names)).size,
    workerFiles: workerFiles.length,
    workerFilesByEvidence: countBy(
      workerFiles.flatMap((entry) => entry.evidence),
      (evidence) => evidence,
    ),
  },
  coreModules,
  plugins,
  services,
  trpcCalls,
  eventCalls,
  uiModules,
  workerFiles,
};

mkdirSync(dirname(output), { recursive: true });

writeFileSync(output, JSON.stringify(inventory, null, 2) + '\n');

console.info(inventory.counts);

console.info(`wrote ${output} in ${Math.round(performance.now() - started)} ms`);
