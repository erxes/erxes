// Turns migration/inventory.json into the port's checklist: MIGRATION.md (one
// section per module), migration/schema-draft.ts (draft Drizzle tables from the
// Mongoose schemas) and migration/import-map.ts (collection → table, for
// scripts/import-mongo.ts). Rerun after `pnpm migrate:inventory`; ticks in an
// existing MIGRATION.md are kept.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type * as pg from 'drizzle-orm/pg-core';
import { z } from 'zod';
import {
  CLIENT_PORTAL,
  CORE_CALLS,
  WHOLE_MODULES,
  type Equivalent,
  HELPERS,
  isClientPortal,
  isStructureField,
  OWN_TEAMS,
  pluginCall,
  PUBLIC_ROUTE,
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

type Item = { section: string; text: string; kind?: Equivalent['kind'] };

const items = new Map<string, Item[]>();

const add = (module: string, section: string, text: string, kind?: Equivalent['kind']) => {
  const list = items.get(module) ?? [];

  list.push({ section, text, kind });
  items.set(module, list);
};

/** Whether the old plugin used core's departments or branches, by call or by field. */
let usesTeams = false;
const TEAMS = `${PLUGIN}_teams`;
const TEAM_MEMBERS = `${PLUGIN}_team_members`;

const describe = (equivalent: Equivalent) =>
  (equivalent.kind === 'gap' || equivalent.kind === 'drop'
    ? `**${equivalent.kind}**: ${equivalent.note ?? ''}`
    : `${equivalent.kind} \`${equivalent.to}\`${equivalent.note ? ` (${equivalent.note})` : ''}`
  ).replaceAll('<plugin>', PLUGIN);

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
  const portal = isClientPortal(op);

  add(
    op.module,
    'Procedures',
    portal
      ? `${op.kind} \`${op.name}\` → ${describe(CLIENT_PORTAL)} ${at(op)}`
      : `${op.kind} \`${op.name}\` → procedure \`${op.module}.${op.name}\` (returns \`${op.returns}\`) ${at(op)}`,
    portal ? 'drop' : undefined,
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

  const equivalent = isClientPortal(call)
    ? CLIENT_PORTAL
    : call.dynamic || !target
      ? UNMAPPED
      : target === 'core'
        ? (CORE_CALLS[key] ?? WHOLE_MODULES[show(call.target)] ?? UNMAPPED)
        : pluginCall(target, plugin, show(call.action));

  add(
    call.module,
    'Core calls',
    `${target ?? '<dynamic>'} \`${key}\` → ${describe(equivalent)} ${at(call)}`,
    equivalent.kind,
  );

  if (equivalent === OWN_TEAMS) usesTeams = true;
}

// Old core's structure: the plugin keeps its own departments and branches, imported with
// their Mongo ids, so the ids its records hold stay valid.
for (const schema of inventory.schemas) {
  for (const field of schema.fields.filter((entry) => isStructureField(entry.name))) {
    usesTeams = true;
    add(
      schema.module,
      'Tables',
      `\`${schema.name}.${field.name}\` → plugin-owned: ids in \`${TEAMS}\`, unchanged by the import ${at(schema)}`,
      OWN_TEAMS.kind,
    );
  }
}

if (usesTeams) {
  add(
    '(plugin)',
    'Tables',
    `\`${TEAMS}\` and \`${TEAM_MEMBERS}\` from old core's \`departments\`, \`branches\` and the members' \`departmentIds\` and \`branchIds\` (drafts in migration/schema-draft.ts, imported by scripts/import-mongo.ts): core has no departments or branches`,
    OWN_TEAMS.kind,
  );
}

for (const call of inventory.eventCalls) {
  const equivalent = isClientPortal(call) ? CLIENT_PORTAL : (HELPERS[call.helper] ?? UNMAPPED);

  add(
    call.module,
    'Events',
    `\`${call.helper}\`${call.type ? ` ${show(call.type)}` : ''} → ${describe(equivalent)} ${at(call)}`,
    equivalent.kind,
  );
}

for (const route of inventory.routes) {
  const equivalent = isClientPortal(route) ? CLIENT_PORTAL : PUBLIC_ROUTE;

  add(
    route.module,
    'Routes',
    `${route.method} \`${route.path}\`${route.webhook ? ' (webhook)' : ''} → ${describe(equivalent)} ${at(route)}`,
    equivalent.kind,
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
    equivalent.kind,
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
const gaps = all.filter((item) => item.kind === 'gap').length;
const drops = all.filter((item) => item.kind === 'drop').length;

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
  `${all.length} items: ${gaps} gaps and ${drops} drops. Follow \`.agents/skills/plugin-migrate\`: one module at a time,`,
  'tick an item once it works on the new core and its old bugs and workarounds are gone, tick a gap once filed, ending its line with `(filed <issue url>)`,',
  'and tick a drop once its code is left out (segments, the client portal and brands are not migrated).',
  '',
  `The old UI imports ${symbols} symbols from \`ui-modules\` in ${inventory.uiModules.files} files; the host has no \`ui-modules\`, so each page rebuilds them from \`erxes-ui\` (members through its \`SelectMember\` and \`MemberInline\`, other records through \`EntityPicker\`). erxes-ui's own old-to-new component table is \`packages/ui/MIGRATION.md\` in erxes (branch \`postgre\`).`,
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

const COLUMN: Record<string, `${keyof typeof pg}(${string})`> = {
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

  // `timestamps: true` adds createdAt and updatedAt below; a schema that also declares them gets them once.
  const stamped = new Set(schema.timestamps ? ['createdAt', 'updatedAt'] : []);

  const fields = schema.fields.filter(
    (entry) => entry.type !== 'spread' && entry.name !== '_id' && !stamped.has(entry.name),
  );

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
      ...spreads.map(
        (entry) => `    // Spread in the old schema, list its fields here: ${entry.name}`,
      ),
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

// The plugin's own departments and branches, in place of old core's structure.
if (usesTeams) {
  tables.push(
    [
      "/** Old core's departments and branches, now the plugin's. Ids are the Mongo `_id`s. */",
      `export const ${camel(TEAMS)} = table(`,
      "  'teams',",
      '  {',
      '    id: text().primaryKey(),',
      '    orgId: text().notNull(),',
      "    kind: text({ enum: ['department', 'branch'] }).notNull(),",
      '    name: text(),',
      '    code: text(),',
      '    parentId: text(),',
      '    supervisorId: text(),',
      '    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),',
      '    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),',
      '  },',
      `  (t) => [index('${TEAMS}_org_idx').on(t.orgId)],`,
      ');',
      '',
      '/**',
      " * Who is in which team, from old users' departmentIds and branchIds. User ids are core's,",
      ' * which keep the Mongo `_id` of members imported from old erxes. Old users may point at',
      ' * removed departments: drop those rows before adding a foreign key to the teams.',
      ' */',
      `export const ${camel(TEAM_MEMBERS)} = table(`,
      "  'team_members',",
      '  {',
      '    orgId: text().notNull(),',
      '    teamId: text().notNull(),',
      '    userId: text().notNull(),',
      '  },',
      `  (t) => [primaryKey({ columns: [t.teamId, t.userId] }), index('${TEAM_MEMBERS}_user_idx').on(t.userId)],`,
      ');',
    ].join('\n'),
  );

  const structure = (collection: string, kind: string) =>
    [
      '  {',
      `    collection: '${collection}',`,
      `    table: '${TEAMS}',`,
      `    values: { kind: '${kind}' },`,
      "    columns: { _id: 'id', title: 'name', code: 'code', parentId: 'parent_id', supervisorId: 'supervisor_id', createdAt: 'created_at' },",
      '  },',
    ].join('\n');

  const members = (field: string) =>
    [
      '  {',
      "    collection: 'users',",
      `    table: '${TEAM_MEMBERS}',`,
      `    unwind: '${field}',`,
      `    columns: { ${field}: 'team_id', _id: 'user_id' },`,
      '  },',
    ].join('\n');

  imports.push(
    structure('departments', 'department'),
    structure('branches', 'branch'),
    members('departmentIds'),
    members('branchIds'),
  );
}

writeFileSync(
  resolve(here, 'schema-draft.ts'),
  [
    `// Draft tables for ${plugin}, written by migration/checklist.ts from the Mongoose`,
    '// schemas. Nothing imports this file: move a table into api/src/db/schema.ts when',
    '// you port its module, pick real types (integer, enums, foreign keys), then run',
    '// `pnpm db:generate` and add its core_enable_tenant_rls line (schema-change skill).',
    `import { boolean, doublePrecision, index, jsonb, ${usesTeams ? 'primaryKey, ' : ''}text, timestamp } from 'drizzle-orm/pg-core';`,
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
    '// `values` are columns every row gets; `unwind` makes one row per item of that array field.',
    'export const IMPORT_MAP: {',
    '  collection: string;',
    '  table: string;',
    '  columns: Record<string, string>;',
    '  values?: Record<string, string>;',
    '  unwind?: string;',
    '}[] = [',
    ...imports,
    '];',
    '',
  ].join('\n'),
);

console.info(
  `MIGRATION.md: ${all.length} items, ${gaps} gaps, ${drops} drops; ${tables.length} draft tables`,
);
