// Inventory of one old erxes plugin: what it declares, stores, serves and calls.
// It reads git objects only (rev-parse, ls-tree, cat-file), never the working
// tree or a database, and writes code metadata (paths, names, counts) to
// migration/inventory.json. Ported from erxes tools/inventory/old-erxes.ts.
//
//   pnpm migrate:inventory -- --from <old erxes checkout> --plugin <name> [--ref origin/main]
//
// With no flags it reruns against the source recorded in inventory.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { Lang, parse, type SgNode } from '@ast-grep/napi';
import { z } from 'zod';

const output = resolve(import.meta.dirname, 'inventory.json');

// One order on every machine, so a rerun on another one changes no line.
const alphabetical = (a: string, b: string) => a.localeCompare(b, 'en');
const argv = process.argv.slice(2);

const { values: args } = parseArgs({
  // `pnpm migrate:inventory -- …` passes the `--` through.
  args: argv[0] === '--' ? argv.slice(1) : argv,
  options: {
    from: { type: 'string' },
    plugin: { type: 'string' },
    ref: { type: 'string' },
  },
});

const Recorded = z.object({
  source: z.object({ from: z.string(), plugin: z.string(), ref: z.string() }),
});

const recorded = existsSync(output)
  ? Recorded.safeParse(JSON.parse(readFileSync(output, 'utf8'))).data?.source
  : undefined;

const given = args.from ?? recorded?.from;
const plugin = args.plugin ?? recorded?.plugin;
const ref = args.ref ?? recorded?.ref ?? 'origin/main';

if (!given || !plugin) {
  throw new Error(
    'Usage: pnpm migrate:inventory -- --from <old erxes checkout> --plugin <name> [--ref origin/main]',
  );
}

// Git takes all three as arguments, so none may read as an option.
if (!/^[a-z][a-z0-9_]*$/.test(plugin)) throw new Error(`Not an old plugin name: ${plugin}`);

if (!/^\w[\w./-]*$/.test(ref)) throw new Error(`Not a git ref: ${ref}`);

const from = resolve(given);

const started = performance.now();
const apiRoot = `backend/plugins/${plugin}_api/`;
const uiRoot = `frontend/plugins/${plugin}_ui/`;
const sourceFile = /\.(ts|tsx|js|jsx|mts|cts)$/;
const testFile = /(?:\/__tests__\/)|(?:\.(?:test|spec)\.\w+$)/;
const workerDir = /^(workers?|crons?)$/i;
const workerName = /^(worker|cron)|(workers?|crons?)$/i;
const eventHelper = /^(sendDbEventLog|sendEvent|sendAutomation\w*|sendNotification\w*)$/;
const webhookPath = /webhook|receive|callback|hook\b/i;
const httpMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'all', 'use']);

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

/**
 * Meta registrations: which array, in which files, names one registered thing.
 * Permission actions are objects; the string lists under `defaultGroups` grant
 * them to a default role and are not new actions.
 */
const REGISTRATIONS = [
  {
    kind: 'permission',
    file: /\/meta\/permissions/,
    key: 'actions',
    id: ['name'],
    objectsOnly: true,
  },
  { kind: 'default role', file: /\/meta\/permissions/, key: 'defaultGroups', id: ['id', 'name'] },
  { kind: 'notification', file: /\/meta\/notifications/, key: 'events', id: ['name'] },
  { kind: 'automation trigger', file: /automation/i, key: 'triggers', id: ['type', 'label'] },
  { kind: 'automation action', file: /automation/i, key: 'actions', id: ['type', 'label'] },
  { kind: 'segment', file: /segment/i, key: 'contentTypes', id: ['type', 'contentType'] },
  {
    kind: 'import-export',
    file: /(?:import-export)|(?:\/main\.ts$)/,
    key: 'types',
    id: ['contentType'],
  },
] as const;

type Field = string | { dynamic: string } | { missing: true };

const git = (...gitArgs: string[]) =>
  execFileSync('git', ['-C', from, ...gitArgs], { encoding: 'utf8', maxBuffer: 1 << 28 });

/** Reads every blob in one `git cat-file --batch` process. */
const readBlobs = (sha: string, paths: string[]) => {
  const result = spawnSync('git', ['-C', from, 'cat-file', '--batch'], {
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
};

/** The module a file belongs to: `src/modules/<module>/…`, else `(plugin)`. */
const moduleOf = (path: string) => /\/src\/modules\/([^/]+)\//.exec(path)?.[1] ?? '(plugin)';

const sourceText = (node: SgNode) => node.text().replaceAll(/\s+/g, ' ');

const unwrap = (node: SgNode): SgNode => {
  const wrapped = ['parenthesized_expression', 'as_expression', 'satisfies_expression'];
  const inner = node.namedChildren()[0];

  return inner && wrapped.some((kind) => node.is(kind)) ? unwrap(inner) : node;
};

/** The value of a string literal or a template without substitutions. */
const literal = (node: SgNode) => {
  if (node.kind() === 'string') return node.text().slice(1, -1);

  if (node.kind() === 'template_string' && !node.has({ rule: { kind: 'template_substitution' } }))
    return node.text().slice(1, -1);

  return undefined;
};

/** A `key: value` pair of an object literal. */
const pairOf = (object: SgNode, key: string) =>
  object
    .namedChildren()
    .find(
      (member) =>
        member.kind() === 'pair' &&
        (literal(member.field('key') ?? member) ?? member.field('key')?.text()) === key,
    )
    ?.field('value');

const field = (object: SgNode, key: string): Field | undefined => {
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
};

/** `foo(...)` is `foo`, `a.b.foo(...)` is `foo`, `cron.schedule(...)` is `cron.schedule`. */
const calleeName = (call: SgNode) => {
  const callee = call.field('function') ?? call.field('constructor');
  const property = callee?.field('property');

  if (!callee) return '';

  if (callee.kind() === 'identifier') return callee.text();

  if (!property) return sourceText(callee);

  const object = callee.field('object');

  return object?.kind() === 'identifier' && workerApis.has(`${object.text()}.${property.text()}`)
    ? `${object.text()}.${property.text()}`
    : property.text();
};

const argumentsOf = (call: SgNode) =>
  (call.field('arguments')?.namedChildren() ?? []).map((arg) => unwrap(arg));

const lineOf = (node: SgNode) => node.range().start.line + 1;

/** The name a value is assigned to: `const x = …`, `x: …` or `export default`. */
const assignedName = (node: SgNode) => {
  for (const ancestor of node.ancestors()) {
    if (ancestor.kind() === 'variable_declarator') return ancestor.field('name')?.text();

    if (ancestor.kind() === 'pair') return ancestor.field('key')?.text();

    if (ancestor.kind() === 'export_statement') return 'default';
  }

  return undefined;
};

// GraphQL SDL ------------------------------------------------------------------

/** Removes balanced `( … )` groups, so `a(x: [Int]): T` reads `a: T`. */
const dropArguments = (text: string) => {
  let out = '';
  let depth = 0;

  for (const char of text) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (depth === 0) out += char;
  }

  return out;
};

/** Field names and return types in an SDL field list. */
const fieldsOf = (body: string) =>
  [...dropArguments(body).matchAll(/([A-Za-z_]\w*)\s*:\s*(\[?\s*[A-Za-z_]\w*!?\s*\]?!?)/g)].map(
    (match) => ({ name: match[1] ?? '', returns: (match[2] ?? '').replaceAll(/\s+/g, '') }),
  );

const OPERATION_BLOCK = /(?:extend\s+)?type\s+(Query|Mutation|Subscription)\s*\{([^}]*)\}/g;
const DEFINITION = /\b(type|input|enum|interface|union|scalar)\s+([A-Za-z_]\w*)/g;

const sdlOf = (template: SgNode, name: string) => {
  const text = template
    .text()
    .slice(1, -1)
    .replaceAll(/\$\{[^}]*\}/g, '')
    .replaceAll(/#[^\n]*/g, '');

  const operations: { kind: string; name: string; returns: string }[] = [];
  const types: { kind: string; name: string }[] = [];

  const listKind = /subscriptions$/i.test(name)
    ? 'subscription'
    : /mutations$/i.test(name)
      ? 'mutation'
      : /queries$/i.test(name)
        ? 'query'
        : undefined;

  if (listKind) {
    for (const op of fieldsOf(text)) operations.push({ kind: listKind, ...op });

    return { operations, types };
  }

  for (const [, kind = '', body = ''] of text.matchAll(OPERATION_BLOCK))
    for (const op of fieldsOf(body)) operations.push({ kind: kind.toLowerCase(), ...op });

  for (const [, kind = '', typeName = ''] of text
    .replaceAll(OPERATION_BLOCK, '')
    .matchAll(DEFINITION))
    types.push({ kind, name: typeName });

  return { operations, types };
};

// Mongoose ---------------------------------------------------------------------

const typeOf = (value: SgNode): string => {
  const node = unwrap(value);

  if (node.kind() === 'array') {
    const first = node.namedChildren()[0];

    return `[${first ? typeOf(first) : 'Mixed'}]`;
  }

  if (node.kind() === 'object') {
    const type = pairOf(node, 'type');

    return type ? typeOf(type) : 'object';
  }

  if (node.kind() === 'new_expression' && calleeName(node) === 'Schema') return 'subdocument';

  return sourceText(node).replace(/^(mongoose\.)?Schema\.Types\./, '');
};

const schemaFieldsOf = (object: SgNode) =>
  object.namedChildren().flatMap((member) => {
    const key = member.field('key');
    const value = member.field('value');

    if (member.kind() === 'spread_element') return [{ name: sourceText(member), type: 'spread' }];

    if (member.kind() !== 'pair' || !key || !value) return [];

    const options = unwrap(value).kind() === 'object' ? unwrap(value) : undefined;

    return [
      {
        name: literal(key) ?? key.text(),
        type: typeOf(value),
        ...(options && pairOf(options, 'required') && { required: true }),
        ...(options && pairOf(options, 'default') && { default: true }),
      },
    ];
  });

// Scanning ---------------------------------------------------------------------

const resolveImport = (file: string, specifier: string, paths: Set<string>) => {
  const pluginRoot = file.startsWith(apiRoot) ? `${apiRoot}src/` : `${uiRoot}src/`;

  const base = specifier.startsWith('.')
    ? normalize(join(dirname(file), specifier))
    : specifier.startsWith('~/')
      ? `${pluginRoot}${specifier.slice(2)}`
      : specifier.startsWith('@/')
        ? `${pluginRoot}modules/${specifier.slice(2)}`
        : undefined;

  if (!base) return undefined;

  return ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx']
    .map((suffix) => `${base}${suffix}`)
    .find((candidate) => paths.has(candidate));
};

const scanFile = (file: string, source: string, paths: Set<string>) => {
  const root = parse(file.endsWith('x') ? Lang.Tsx : Lang.TypeScript, source).root();
  const module = moduleOf(file);
  const trpcNames = new Set(['sendTRPCMessage']);
  /** Local name → the file it comes from and its name there. */
  const imports = new Map<string, { file: string; name: string }>();

  /** A name defined here or imported: `file#name`. */
  const origin = (local: string) => {
    const imported = imports.get(local);

    return imported ? `${imported.file}#${imported.name}` : `${file}#${local}`;
  };

  const uiImports: string[] = [];
  const workerEvidence = new Set<string>();
  const constants: [string, string][] = [];

  for (const statement of root.findAll({ rule: { kind: 'import_statement' } })) {
    const specifier = literal(statement.field('source') ?? statement) ?? '';
    const target = resolveImport(file, specifier, paths);
    const clause = statement.find({ rule: { kind: 'import_clause' } });

    for (const part of clause?.namedChildren() ?? []) {
      if (part.kind() === 'identifier') {
        if (target) imports.set(part.text(), { file: target, name: 'default' });

        if (specifier.startsWith('ui-modules')) uiImports.push('default');
      }

      for (const specifierNode of part.findAll({ rule: { kind: 'import_specifier' } })) {
        const name = specifierNode.field('name')?.text() ?? '';
        const alias = specifierNode.field('alias')?.text();

        if (target) imports.set(alias ?? name, { file: target, name });

        if (specifier.startsWith('ui-modules')) uiImports.push(name);

        if (name === 'sendTRPCMessage' && alias) trpcNames.add(alias);
      }
    }
  }

  for (const declarator of root.findAll({ rule: { kind: 'variable_declarator' } })) {
    const value = declarator.field('value');
    const text = value ? literal(unwrap(value)) : undefined;

    const name = declarator.field('name')?.text() ?? '';

    if (text !== undefined) constants.push([name, text]);

    // `const Paths = { Detail: 'x' }` gives `Paths.Detail`.
    if (value && unwrap(value).kind() === 'object') {
      for (const pair of unwrap(value).namedChildren()) {
        const key = pair.field('key');
        const member = pair.field('value');
        const memberText = member ? literal(unwrap(member)) : undefined;

        if (pair.kind() === 'pair' && key && memberText !== undefined)
          constants.push([`${name}.${literal(key) ?? key.text()}`, memberText]);
      }
    }
  }

  // `enum Paths { Detail = 'x' }` gives `Paths.Detail`.
  for (const declaration of root.findAll({ rule: { kind: 'enum_declaration' } })) {
    const name = declaration.field('name')?.text() ?? '';

    for (const member of declaration.findAll({ rule: { kind: 'enum_assignment' } })) {
      const memberValue = member.field('value');
      const memberText = memberValue ? literal(memberValue) : undefined;

      if (memberText !== undefined)
        constants.push([`${name}.${member.field('name')?.text() ?? ''}`, memberText]);
    }
  }

  const trpcCalls = [];
  const eventCalls = [];
  const schemas = [];
  const models = [];
  const loaders: [string, string][] = [];
  const routes = [];
  const mounts = [];
  const env = [];

  for (const call of root.findAll({
    rule: { any: [{ kind: 'call_expression' }, { kind: 'new_expression' }] },
  })) {
    const isNew = call.kind() === 'new_expression';
    const name = isNew ? `new ${calleeName(call)}` : calleeName(call);
    const line = lineOf(call);
    const [arg, second] = argumentsOf(call);
    const object = arg?.kind() === 'object' ? arg : undefined;

    if (workerApis.has(name)) workerEvidence.add(name);

    if (trpcNames.has(name)) {
      const missing = { missing: true } as const;
      const method = object && field(object, 'method');

      trpcCalls.push(
        object
          ? {
              file,
              line,
              module,
              pluginName: field(object, 'pluginName') ?? missing,
              target: field(object, 'module') ?? missing,
              action: field(object, 'action') ?? missing,
              ...(method && { method }),
            }
          : { file, line, module, dynamic: arg ? sourceText(arg) : '<no argument>' },
      );
    }

    if (eventHelper.test(name)) {
      const type = object && field(object, 'type');
      const action = object && field(object, 'action');

      eventCalls.push({
        file,
        line,
        module,
        helper: name,
        ...(type && { type }),
        ...(action && { action }),
      });
    }

    if (name === 'new Schema' && object) {
      const options = second?.kind() === 'object' ? second : undefined;

      schemas.push({
        file,
        line,
        module,
        name: assignedName(call) ?? '',
        timestamps: Boolean(options && pairOf(options, 'timestamps')),
        fields: schemaFieldsOf(object),
      });
    }

    if (name === 'model' && !isNew && arg && literal(arg) !== undefined) {
      const loader = second?.kind() === 'call_expression' ? calleeName(second) : second?.text();

      models.push({
        file,
        line,
        collection: literal(arg) ?? '',
        model: assignedTarget(call),
        loader: loader ? origin(loader) : undefined,
      });
    }

    if (name === 'loadClass') {
      const owner = call.field('function')?.field('object')?.text();

      const enclosing = call
        .ancestors()
        .find(
          (ancestor) =>
            ancestor.kind() === 'variable_declarator' || ancestor.kind() === 'function_declaration',
        );

      if (owner && enclosing)
        loaders.push([`${file}#${enclosing.field('name')?.text() ?? ''}`, origin(owner)]);
    }

    const callee = call.field('function');
    const receiver = callee?.field('object')?.text() ?? '';
    const method = callee?.field('property')?.text() ?? '';

    if (!isNew && httpMethods.has(method) && /^(app|\w*router)$/i.test(receiver) && arg) {
      const path = literal(arg);

      if (path !== undefined && method === 'use') {
        const target = second && imports.get(second.text())?.file;

        if (target) mounts.push({ file, prefix: path, target });
      } else if (path !== undefined) {
        routes.push({
          file,
          line,
          module,
          method: method.toUpperCase(),
          path,
          webhook: webhookPath.test(path),
        });
      }
    }

    if (name === 'getEnv' && object) {
      const envName = field(object, 'name');

      if (typeof envName === 'string') env.push({ name: envName, file, line });
    }
  }

  for (const member of root.findAll({ rule: { kind: 'member_expression' } })) {
    if (member.field('object')?.text() !== 'process.env') continue;

    env.push({ name: member.field('property')?.text() ?? '', file, line: lineOf(member) });
  }

  for (const declarator of root.findAll({ rule: { kind: 'variable_declarator' } })) {
    const pattern = declarator.field('name');
    const body = declarator.field('value')?.field('body');

    // `export const loadXClass = () => xSchema`
    if (body?.kind() === 'identifier')
      loaders.push([`${file}#${pattern?.text() ?? ''}`, origin(body.text())]);

    if (declarator.field('value')?.text() !== 'process.env' || pattern?.kind() !== 'object_pattern')
      continue;

    for (const key of pattern.findAll({ rule: { kind: 'shorthand_property_identifier_pattern' } }))
      env.push({ name: key.text(), file, line: lineOf(key) });
  }

  // GraphQL SDL in template strings named types / queries / mutations / subscriptions, or gql``.
  const graphql = { operations: [] as object[], types: [] as object[] };

  for (const template of root.findAll({ rule: { kind: 'template_string' } })) {
    const tagged = template.parent()?.kind() === 'call_expression';
    const name = assignedName(template) ?? '';

    if (!/(types?|queries|mutations|subscriptions)$/i.test(name) && !tagged) continue;

    if (!/\/(graphql|apollo)\//.test(file) || testFile.test(file)) continue;

    const sdl = sdlOf(template, name);
    const at = lineOf(template);

    graphql.operations.push(...sdl.operations.map((op) => ({ ...op, file, line: at, module })));
    graphql.types.push(...sdl.types.map((type) => ({ ...type, file, line: at, module })));
  }

  // React Router: <Route path> elements, nested paths joined within the file.
  const uiRoutes = [];

  const jsx = file.endsWith('x')
    ? root.findAll({
        rule: { any: [{ kind: 'jsx_element' }, { kind: 'jsx_self_closing_element' }] },
      })
    : [];

  for (const element of jsx) {
    const opening = element.kind() === 'jsx_element' ? element.field('open_tag') : element;

    if (opening?.field('name')?.text() !== 'Route') continue;

    const segments = [element, ...element.ancestors()]
      .filter((node) => node.kind() === 'jsx_element' || node.kind() === 'jsx_self_closing_element')
      .map((node) => routeAttributes(node.kind() === 'jsx_element' ? node.field('open_tag') : node))
      .filter((attributes) => attributes.route)
      .map((attributes) => attributes.path)
      .toReversed();

    const own = routeAttributes(opening);

    // Redirects are not pages.
    if (!own.element || own.element === 'Navigate') continue;

    uiRoutes.push({
      file,
      line: lineOf(element),
      path: segments.filter(Boolean).join('/').replaceAll(/\/+/g, '/') || '/',
      element: own.element,
    });
  }

  // Meta registrations.
  const registrations = [];

  for (const rule of REGISTRATIONS) {
    if (!rule.file.test(file)) continue;

    for (const pair of root.findAll({ rule: { kind: 'pair' } })) {
      if (pair.field('key')?.text() !== rule.key || pair.field('value')?.kind() !== 'array')
        continue;

      for (const entry of pair.field('value')?.namedChildren() ?? []) {
        if ('objectsOnly' in rule && entry.kind() !== 'object') continue;

        const value =
          entry.kind() === 'object'
            ? rule.id.map((key) => field(entry, key)).find((candidate) => candidate !== undefined)
            : literal(entry);

        if (value === undefined) continue;

        // The group is the owner's `name` (a permission module), else the key
        // the owner sits under (`import: { types }`, `export: { types }`).
        const owner = pair.parent();
        const name = owner && field(owner, 'name');
        const above = owner?.parent();

        const group =
          typeof name === 'string'
            ? name
            : above?.kind() === 'pair'
              ? above.field('key')?.text()
              : undefined;

        registrations.push({
          kind: rule.kind,
          file,
          line: lineOf(entry),
          id: value,
          ...(group && { group }),
        });
      }
    }
  }

  const segments = file.split('/');
  const stem = (segments.at(-1) ?? '').replace(/\.[^.]+$/, '');

  if (segments.slice(0, -1).some((segment) => workerDir.test(segment)) || workerName.test(stem))
    workerEvidence.add('path');

  return {
    trpcCalls,
    eventCalls,
    schemas,
    models,
    loaders,
    routes,
    mounts,
    env,
    graphql,
    uiRoutes,
    registrations,
    constants,
    uiImports: uiImports.length ? { file, names: uiImports } : undefined,
    workerEvidence: [...workerEvidence].toSorted(alphabetical),
  };
};

/** `models.Task = db.model(…)` is `Task`. */
function assignedTarget(call: SgNode) {
  const assignment = call.ancestors().find((node) => node.kind() === 'assignment_expression');
  const left = assignment?.field('left');

  return left?.field('property')?.text() ?? left?.text() ?? assignedName(call);
}

function routeAttributes(opening: SgNode | null) {
  const attributes = opening?.findAll({ rule: { kind: 'jsx_attribute' } }) ?? [];

  const value = (name: string) =>
    attributes.find((attribute) => attribute.child(0)?.text() === name)?.child(2);

  const pathNode = value('path');
  const elementNode = value('element');

  const component = elementNode?.find({
    rule: { any: [{ kind: 'jsx_self_closing_element' }, { kind: 'jsx_opening_element' }] },
  });

  return {
    route: opening?.field('name')?.text() === 'Route',
    path: pathNode ? (literal(pathNode) ?? sourceText(pathNode)) : '',
    element: component?.field('name')?.text(),
  };
}

const countBy = <T>(items: T[], key: (item: T) => string) => {
  const counts = new Map<string, number>();

  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);

  return Object.fromEntries([...counts].toSorted(([a], [b]) => a.localeCompare(b)));
};

const sha = git('rev-parse', '--verify', `${ref}^{commit}`).trim();

const allPaths = git('ls-tree', '-r', '-z', '--name-only', sha, '--', apiRoot, uiRoot)
  .split('\0')
  .filter(Boolean)
  .toSorted(alphabetical);

if (!allPaths.some((path) => path.startsWith(apiRoot)))
  throw new Error(`${ref} has no ${apiRoot} in ${from}`);

const pathSet = new Set(allPaths);
const sources = allPaths.filter((path) => sourceFile.test(path) && !testFile.test(path));
const blobs = readBlobs(sha, sources);
const scans = sources.map((file) => scanFile(file, blobs.get(file) ?? '', pathSet));

type Scan = (typeof scans)[number];

type ListKey = { [K in keyof Scan]: Scan[K] extends readonly unknown[] ? K : never }[keyof Scan];

const all = <K extends ListKey>(key: K) => scans.map((scan) => scan[key]).flat();

// Constants by name, so `type: TASK_TARGET` reads as its string.
const constants = new Map(scans.flatMap((scan) => scan.constants));

const resolveField = (value: Field): Field =>
  typeof value === 'object' && 'dynamic' in value && constants.has(value.dynamic)
    ? (constants.get(value.dynamic) ?? value)
    : value;

// Which schema each collection stores: `db.model('x', loadXClass(...))` and `xSchema.loadClass(...)`.
const loaders = new Map(all('loaders'));
const schemas = all('schemas');
const schemaRefs = new Map(schemas.map((schema) => [`${schema.file}#${schema.name}`, schema]));

const collections = all('models').map((model) => {
  const schemaRef = model.loader ? (loaders.get(model.loader) ?? model.loader) : undefined;
  const schema = schemaRef ? schemaRefs.get(schemaRef) : undefined;

  return {
    ...model,
    schema: schema ? schemaRef : null,
    module: schema?.module ?? moduleOf(model.file),
  };
});

// Express mounts: `router.use('/facebook', facebookRouter)` prefixes that file's routes.
const mounts = all('mounts');

const prefixOf = (file: string, seen = new Set<string>()): string => {
  const mount = mounts.find((candidate) => candidate.target === file);

  if (!mount || seen.has(file)) return '';

  seen.add(file);

  return `${prefixOf(mount.file, seen)}${mount.prefix}`;
};

const routes = all('routes').map((route) => {
  const path = `${prefixOf(route.file)}${route.path}`.replaceAll(/\/+/g, '/');

  return { ...route, path, webhook: route.webhook || webhookPath.test(path) };
});

const uiModuleImports = scans.flatMap((scan) => (scan.uiImports ? [scan.uiImports] : []));

const env = [...new Map(all('env').map((entry) => [entry.name, entry])).values()].toSorted((a, b) =>
  a.name.localeCompare(b.name),
);

const registrations = all('registrations').map((entry) => ({
  ...entry,
  id: resolveField(entry.id),
}));

const eventCalls = all('eventCalls').map((call) => ({
  ...call,
  ...('type' in call && call.type && { type: resolveField(call.type) }),
}));

const workerFiles = sources.flatMap((file, index) => {
  const evidence = scans[index]?.workerEvidence ?? [];

  return evidence.length > 0 ? [{ file, evidence }] : [];
});

const trpcCalls = all('trpcCalls');
const graphqlOperations = scans.flatMap((scan) => scan.graphql.operations);
const graphqlTypes = scans.flatMap((scan) => scan.graphql.types);

const uiRoutes = all('uiRoutes')
  .filter((route) => route.file.startsWith(uiRoot))
  .map((route) => ({
    ...route,
    // `path={Paths.Detail}` reads as the constant's value.
    path: route.path.replaceAll(
      /\{([^}]+)\}/g,
      (_match, expression: string) => constants.get(expression.trim()) ?? `:${expression.trim()}`,
    ),
  }));

const modules = [...new Set(sources.map(moduleOf))].toSorted(alphabetical);

const inventory = {
  source: { repo: 'erxes/erxes', from, plugin, ref, sha },
  counts: {
    sourceFiles: sources.length,
    modules: modules.length,
    graphqlTypes: graphqlTypes.length,
    graphqlOperations: graphqlOperations.length,
    graphqlOperationsByKind: countBy(graphqlOperations, (op) =>
      'kind' in op ? String(op.kind) : '',
    ),
    mongooseSchemas: schemas.length,
    collections: collections.length,
    expressRoutes: routes.length,
    webhooks: routes.filter((route) => route.webhook).length,
    uiRoutes: uiRoutes.length,
    trpcCalls: trpcCalls.length,
    trpcCallsByTarget: countBy(trpcCalls, (call) =>
      'pluginName' in call && typeof call.pluginName === 'string' ? call.pluginName : '<dynamic>',
    ),
    eventHelperCalls: eventCalls.length,
    uiModulesFiles: uiModuleImports.length,
    uiModulesSymbols: new Set(uiModuleImports.flatMap((entry) => entry.names)).size,
    workerFiles: workerFiles.length,
    registrations: registrations.length,
    registrationsByKind: countBy(registrations, (entry) => entry.kind),
    envVars: env.length,
  },
  modules,
  graphql: { types: graphqlTypes, operations: graphqlOperations },
  schemas,
  collections,
  routes,
  uiRoutes,
  trpcCalls,
  eventCalls,
  uiModules: {
    files: uiModuleImports.length,
    symbols: countBy(
      uiModuleImports.flatMap((entry) => [...new Set(entry.names)]),
      (name) => name,
    ),
  },
  workerFiles,
  registrations,
  env,
};

writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);

console.info(inventory.counts);

console.info(`wrote ${output} in ${Math.round(performance.now() - started)} ms`);
