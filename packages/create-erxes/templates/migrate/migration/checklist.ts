// Turns migration/inventory.json into the port's checklist: MIGRATION.md (one
// section per module), migration/schema-draft.ts (draft Drizzle tables from the
// Mongoose schemas) and migration/import-map.ts (collection → table, for
// scripts/import-mongo.ts). Rerun after `pnpm migrate:inventory`; ticks in an
// existing MIGRATION.md are kept.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import {
  CORE_CALLS,
  type Equivalent,
  HELPERS,
  pluginCall,
  REGISTRATIONS,
  UNMAPPED,
} from './core-map.ts';

const here = import.meta.dirname;
const root = resolve(here, '..');
const alphabetical = (a: string, b: string) => a.localeCompare(b, 'en');

const Value = z.union([
  z.string(),
  z.object({ dynamic: z.string() }),
  z.object({ missing: z.literal(true) }),
]);

const Located = z.object({ file: z.string(), line: z.number() });
const InModule = Located.extend({ module: z.string() });

const Inventory = z.object({
  source: z.object({ plugin: z.string(), ref: z.string(), sha: z.string() }),
  modules: z.array(z.string()),
  graphql: z.object({
    operations: z.array(
      InModule.extend({ kind: z.string(), name: z.string(), returns: z.string() }),
    ),
    types: z.array(InModule.extend({ kind: z.string(), name: z.string() })),
  }),
  schemas: z.array(
    InModule.extend({
      name: z.string(),
      timestamps: z.boolean(),
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean().optional(),
        }),
      ),
    }),
  ),
  collections: z.array(
    Located.extend({ collection: z.string(), module: z.string(), schema: z.string().nullable() }),
  ),
  routes: z.array(InModule.extend({ method: z.string(), path: z.string(), webhook: z.boolean() })),
  uiRoutes: z.array(Located.extend({ path: z.string(), element: z.string() })),
  trpcCalls: z.array(
    InModule.extend({
      pluginName: Value.optional(),
      target: Value.optional(),
      action: Value.optional(),
      dynamic: z.string().optional(),
    }),
  ),
  eventCalls: z.array(InModule.extend({ helper: z.string(), type: Value.optional() })),
  workerFiles: z.array(z.object({ file: z.string(), evidence: z.array(z.string()) })),
  registrations: z.array(
    Located.extend({ kind: z.string(), id: Value, group: z.string().optional() }),
  ),
  env: z.array(Located.extend({ name: z.string() })),
  uiModules: z.object({ files: z.number(), symbols: z.record(z.string(), z.number()) }),
});

const inventory = Inventory.parse(
  JSON.parse(readFileSync(resolve(here, 'inventory.json'), 'utf8')),
);

/** The new plugin's name; the old one's is `inventory.source.plugin`. */
const PLUGIN = '__id__';
const { plugin } = inventory.source;
const short = (file: string) => file.replace(/^(backend|frontend)\/plugins\//, '');
const at = (item: { file: string; line: number }) => `\`${short(item.file)}:${item.line}\``;

const show = (value: z.infer<typeof Value> | undefined) =>
  value === undefined
    ? '?'
    : typeof value === 'string'
      ? value
      : 'dynamic' in value
        ? `<${value.dynamic}>`
        : '?';

// Variables old erxes itself needed; core and the template replace them.
const RUNTIME_ENV =
  /^(NODE_ENV|PORT|MONGO_URL|REDIS_\w+|RABBITMQ\w*|ELASTICSEARCH\w*|ENABLED_PLUGINS\w*|LOAD_BALANCER_ADDRESS|VERSION|DOMAIN|MAIN_APP_DOMAIN|UI_ENTRY_URL)$/;

// Checklist items -------------------------------------------------------------

type Item = { section: string; text: string; gap: boolean };

const items = new Map<string, Item[]>();

const add = (module: string, section: string, text: string, gap = false) => {
  const list = items.get(module) ?? [];

  list.push({ section, text, gap });
  items.set(module, list);
};

const describe = (equivalent: Equivalent) =>
  equivalent.kind === 'gap'
    ? `**gap**: ${equivalent.note ?? ''}`
    : `${equivalent.kind} \`${equivalent.to.replaceAll('<plugin>', PLUGIN)}\`${equivalent.note ? ` (${equivalent.note})` : ''}`;

const camel = (text: string) =>
  text.replaceAll(/[_-](\w)/g, (_match, char: string) => char.toUpperCase());

const tableName = (collection: string) =>
  `${PLUGIN}_${collection.startsWith(`${plugin}_`) ? collection.slice(plugin.length + 1) : collection}`;

const schemaByRef = new Map(
  inventory.schemas.map((schema) => [`${schema.file}#${schema.name}`, schema]),
);

for (const collection of inventory.collections) {
  const schema = collection.schema ? schemaByRef.get(collection.schema) : undefined;
  const table = tableName(collection.collection);

  add(
    collection.module,
    'Tables',
    schema
      ? `\`${table}\` from collection \`${collection.collection}\` (${schema.fields.length} fields, draft \`${camel(table)}\` in migration/schema-draft.ts) ${at(schema)}`
      : `\`${table}\` from collection \`${collection.collection}\` (schema not found: write it by hand) ${at(collection)}`,
  );
}

for (const op of inventory.graphql.operations) {
  add(
    op.module,
    'Procedures',
    `${op.kind} \`${op.name}\` → procedure \`${op.module}.${op.name}\` (returns \`${op.returns}\`) ${at(op)}`,
  );
}

// A page belongs to the module its component or last path segment names.
const singular = (word: string) => word.replace(/ies$/, 'y').replace(/s$/, '');

const moduleOfPage = (route: { path: string; element: string }) => {
  const byName = inventory.modules
    .filter((module) => route.element.toLowerCase().includes(module.toLowerCase()))
    .toSorted((a, b) => b.length - a.length)[0];

  const segment = route.path
    .split('/')
    .filter((part) => part && !part.startsWith(':') && part !== '*')
    .at(-1);

  const bySegment = segment && inventory.modules.find((module) => module === singular(segment));

  return byName ?? bySegment ?? '(plugin)';
};

for (const route of inventory.uiRoutes) {
  add(
    moduleOfPage(route),
    'Pages',
    `\`/${PLUGIN}/${route.path.replace(/^\//, '')}\` (${route.element}) ${at(route)}`,
  );
}

for (const call of inventory.trpcCalls) {
  const target = typeof call.pluginName === 'string' ? call.pluginName : undefined;
  const key = `${show(call.target)}.${show(call.action)}`;

  const equivalent =
    call.dynamic || !target
      ? UNMAPPED
      : target === 'core'
        ? (CORE_CALLS[key] ?? UNMAPPED)
        : pluginCall(target, plugin);

  add(
    call.module,
    'Core calls',
    `${target ?? '<dynamic>'} \`${key}\` → ${describe(equivalent)} ${at(call)}`,
    equivalent.kind === 'gap',
  );
}

for (const call of inventory.eventCalls) {
  const equivalent = HELPERS[call.helper] ?? UNMAPPED;

  add(
    call.module,
    'Events',
    `\`${call.helper}\`${call.type ? ` ${show(call.type)}` : ''} → ${describe(equivalent)} ${at(call)}`,
    equivalent.kind === 'gap',
  );
}

for (const route of inventory.routes) {
  add(
    route.module,
    'Routes',
    `${route.method} \`${route.path}\`${route.webhook ? ' (webhook)' : ''} → **gap**: a public route, and core can't yet tell a public request's organisation ${at(route)}`,
    true,
  );
}

for (const worker of inventory.workerFiles) {
  add(
    '(plugin)',
    'Workers and crons',
    `\`${short(worker.file)}\` (${worker.evidence.join(', ')}) → plugin-owned: a job in the API process`,
  );
}

for (const entry of inventory.registrations) {
  const equivalent = REGISTRATIONS[entry.kind] ?? UNMAPPED;

  add(
    '(plugin)',
    'Registrations',
    `${entry.kind} \`${show(entry.id)}\`${entry.group ? ` (${entry.group})` : ''} → ${describe(equivalent)} ${at(entry)}`,
    equivalent.kind === 'gap',
  );
}

const env = inventory.env.filter((entry) => !RUNTIME_ENV.test(entry.name));

for (const entry of env) {
  add('(plugin)', 'Environment', `\`${entry.name}\` → api/src/config.ts ${at(entry)}`);
}

// MIGRATION.md -------------------------------------------------------------------

const markdown = resolve(root, 'MIGRATION.md');

// Ticks survive a rerun: an item's text without its checkbox is its key, and a
// filed gap keeps its ` (filed <url>)` suffix.
const ticked = new Map(
  existsSync(markdown)
    ? [...readFileSync(markdown, 'utf8').matchAll(/^- \[x\] (.+?)( \(filed \S+\))?$/gm)].map(
        (match) => [match[1], match[2] ?? ''] as const,
      )
    : [],
);

const all = [...items.values()].flat();
const gaps = all.filter((item) => item.gap).length;

const order = [
  '(plugin)',
  ...[...items.keys()].filter((module) => module !== '(plugin)').toSorted(alphabetical),
];

const sections = [
  'Tables',
  'Procedures',
  'Pages',
  'Core calls',
  'Events',
  'Routes',
  'Workers and crons',
  'Registrations',
  'Environment',
];

const symbols = Object.keys(inventory.uiModules.symbols).length;

const lines = [
  `# Migrating ${plugin} to the new core`,
  '',
  `From erxes/erxes \`${inventory.source.ref}\` (${inventory.source.sha.slice(0, 10)}), \`${plugin}_api\` and \`${plugin}_ui\`.`,
  `${all.length} items, ${gaps} of them gaps. Follow \`.agents/skills/plugin-migrate\`: one module at a time,`,
  'tick an item once it works on the new core and its old bugs and workarounds are gone, and tick a gap once filed, ending its line with `(filed <issue url>)`.',
  '',
  `The old UI imports ${symbols} symbols from \`ui-modules\` in ${inventory.uiModules.files} files; the host has no \`ui-modules\`, so each page rebuilds them from \`erxes-ui\`. Its old-to-new component table is \`packages/ui/MIGRATION.md\` in erxes (branch \`postgre\`).`,
  `GraphQL types (${inventory.graphql.types.length}) are listed in \`migration/inventory.json\` for reference; procedures replace them.`,
  '',
];

for (const module of order) {
  const moduleItems = items.get(module) ?? [];

  if (!moduleItems.length) continue;

  lines.push(`## ${module === '(plugin)' ? 'Plugin-wide' : module}`, '');

  for (const section of sections) {
    const sectionItems = moduleItems.filter((item) => item.section === section);

    if (!sectionItems.length) continue;

    lines.push(`### ${section}`, '');

    for (const item of sectionItems) {
      const filed = ticked.get(item.text);
      lines.push(filed === undefined ? `- [ ] ${item.text}` : `- [x] ${item.text}${filed}`);
    }

    lines.push('');
  }
}

writeFileSync(markdown, lines.join('\n'));

// schema-draft.ts and import-map.ts ------------------------------------------------

const COLUMN: Record<string, string> = {
  String: 'text()',
  Number: 'doublePrecision()',
  Boolean: 'boolean()',
  Date: 'timestamp({ withTimezone: true })',
  ObjectId: 'text()',
};

const columnOf = (type: string) => {
  const array = /^\[(.*)\]$/.exec(type);
  const scalar = COLUMN[array?.[1] ?? type];

  if (array) return scalar && array[1] !== 'Date' ? `${scalar}.array()` : 'jsonb()';

  return scalar ?? 'jsonb()';
};

const identifier = (name: string) =>
  /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);

const snake = (name: string) => name.replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const drafted = new Set<string>();
const tables: string[] = [];
const imports: string[] = [];

for (const collection of inventory.collections) {
  const schema = collection.schema ? schemaByRef.get(collection.schema) : undefined;
  const table = tableName(collection.collection);

  if (!schema || drafted.has(table)) continue;

  drafted.add(table);

  const fields = schema.fields.filter((entry) => entry.type !== 'spread' && entry.name !== '_id');

  const columns = fields.map((entry) => {
    const column = `${columnOf(entry.type)}${entry.required ? '.notNull()' : ''}`;

    return `    ${identifier(entry.name)}: ${column}, // ${entry.type}`;
  });

  const spreads = schema.fields.filter((entry) => entry.type === 'spread');

  const stamps = schema.timestamps
    ? [
        '    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),',
        '    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),',
      ]
    : [];

  tables.push(
    [
      `/** From \`${collection.collection}\` (${short(schema.file)}:${schema.line}). */`,
      `export const ${camel(table)} = table(`,
      `  '${table.slice(PLUGIN.length + 1)}',`,
      '  {',
      '    // The Mongo `_id`, kept as text so references survive the import.',
      '    id: text().primaryKey(),',
      '    orgId: text().notNull(),',
      ...spreads.map((entry) => `    // TODO spread in the old schema: ${entry.name}`),
      ...columns,
      ...stamps,
      '  },',
      `  (t) => [index('${table}_org_idx').on(t.orgId)],`,
      ');',
    ].join('\n'),
  );

  const columnMap = [
    "      _id: 'id',",
    ...fields.map((entry) => `      ${identifier(entry.name)}: '${snake(entry.name)}',`),
    ...(schema.timestamps
      ? ["      createdAt: 'created_at',", "      updatedAt: 'updated_at',"]
      : []),
  ];

  imports.push(
    [
      `  {`,
      `    collection: '${collection.collection}',`,
      `    table: '${table}',`,
      '    columns: {',
      ...columnMap,
      '    },',
      '  },',
    ].join('\n'),
  );
}

writeFileSync(
  resolve(here, 'schema-draft.ts'),
  [
    `// Draft tables for ${plugin}, written by migration/checklist.ts from the Mongoose`,
    '// schemas. Nothing imports this file: move a table into api/src/db/schema.ts when',
    '// you port its module, pick real types (integer, enums, foreign keys), then run',
    '// `pnpm db:generate` and add its core_enable_tenant_rls line (schema-change skill).',
    "import { boolean, doublePrecision, index, jsonb, text, timestamp } from 'drizzle-orm/pg-core';",
    "import { table } from '../api/src/db/table.ts';",
    '',
    tables.join('\n\n'),
    '',
  ].join('\n'),
);

writeFileSync(
  resolve(here, 'import-map.ts'),
  [
    '// Which Mongo field goes to which column, per collection, for scripts/import-mongo.ts.',
    '// Written by migration/checklist.ts; edit it as the tables in api/src/db/schema.ts change.',
    'export const IMPORT_MAP: { collection: string; table: string; columns: Record<string, string> }[] = [',
    ...imports,
    '];',
    '',
  ].join('\n'),
);

console.info(`MIGRATION.md: ${all.length} items, ${gaps} gaps; ${tables.length} draft tables`);
