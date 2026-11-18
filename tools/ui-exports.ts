// Writes packages/ui/exports.txt, the names plugin UIs import from erxes-ui and the libraries web
// shares with them, and packages/ui/CATALOG.md, what each name is for, from its doc comment.
// Both are committed and checked by `pnpm check:generated`: a removal shows in the PR's diff
// instead of as a crash in a plugin built against the old list, and the catalog that ships in
// erxes-ui stays true. An export without a doc comment fails here.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseSync } from 'oxc-parser';
import { SHARED } from '../packages/ui/src/federation.ts';
import { describeExport, type Hint, resolveModule } from './ui-docs.ts';

const repo = new URL('../', import.meta.url);
const ui = new URL('packages/ui/', repo);
const indexFile = fileURLToPath(new URL('src/index.ts', ui));
const { module, errors } = parseSync('index.ts', await readFile(indexFile, 'utf8'));
const [error] = errors;

if (error) throw new Error(error.message);

const exported = module.staticExports
  .flatMap((statement) => statement.entries)
  .map(({ exportName, importName, moduleRequest, isType }) => {
    const name = exportName.name;

    if (!name || !importName.name || !moduleRequest) {
      throw new Error('src/index.ts exports names one by one, not export *');
    }

    const file = resolveModule(indexFile, moduleRequest.value);

    return { name, isType, file, ...describeExport(file, importName.name) };
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

// The catalog line is the doc comment's first sentence: a summary short enough to scan, with
// the detail in the sentences after it.
const maxSummary = 72;
const undocumented = exported.filter((entry) => !entry.doc);
const overlong = exported.filter((entry) => entry.doc && entry.doc.length > maxSummary);

if (undocumented.length > 0 || overlong.length > 0) {
  const names = (entries: typeof exported) =>
    entries.map((entry) => `  ${entry.name} (${entry.file})`).join('\n');

  throw new Error(
    [
      undocumented.length > 0 &&
        `Every erxes-ui export needs a doc comment, for CATALOG.md. Add one above:\n${names(undocumented)}`,
      overlong.length > 0 &&
        `A doc comment's first sentence is its CATALOG.md line, at most ${maxSummary} characters. Shorten:\n${names(overlong)}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

// The page kinds, what builds each and the screen to copy, as the ui-patterns skill
// (packages/create-erxes/templates/base/.agents/skills/ui-patterns) has them.
const core = 'apps/web/src/modules/';
const template = 'packages/create-erxes/templates/base/';

const pages = [
  ['List', 'PageHeader, ViewBar, ListFilter, RecordTable', 'ui/src/modules/items/ItemsPage.tsx'],
  ['Grouped list (by status)', 'RecordList, DisplayMenu, useListDisplay', ''],
  ['Board', 'Board, DisplayMenu, useListDisplay', `${core}leads/LeadsBoard.tsx`],
  ['Cards or chart', 'DisplayMenu, useListDisplay, TListDisplayOption', ''],
  [
    'Record detail',
    'PanelSection, PanelField, RecordTableInlineCell, RecordPage',
    'ui/src/modules/items/ItemPanel.tsx',
  ],
  ['Create/edit form', 'PanelFormLayout, PanelFormRow', 'ui/src/modules/items/ItemPanel.tsx'],
  ['Settings list', 'PageHeader, RecordTable', `${core}settings/tags/TagsSettingsPage.tsx`],
  ['Settings form', 'Form, Switch, ScrollArea', `${core}settings/profile/ProfileSettingsPage.tsx`],
  ['Filters', 'ListFilter, useListFilterParams', 'ui/src/modules/items/ItemsPage.tsx'],
  ['Chart', 'ChartContainer, ChartTooltipContent, ChartLegendContent', ''],
];

for (const [, components = '', screen = ''] of pages) {
  const missing = components.split(', ').filter((name) => !exported.some((e) => e.name === name));
  const path = screen.startsWith('ui/') ? template + screen : screen;

  if (missing.length > 0) throw new Error(`CATALOG.md names missing exports: ${missing.join()}`);

  if (path && !existsSync(new URL(path, repo))) throw new Error(`CATALOG.md names ${path}`);
}

// Where each export is listed, by the folder under packages/ui/src it lives in. First match wins.
const sections = [
  ['Page', ['modules/layout/', 'modules/navigation-menu/']],
  [
    'Lists',
    [
      'modules/list/',
      'modules/board/',
      'modules/record-list/',
      'modules/record-table/',
      'modules/filter/',
    ],
  ],
  ['Records', ['modules/record-panel/', 'modules/records/', 'utils/record-timeline']],
  [
    'Fields and pickers',
    [
      'modules/record-field/',
      'modules/inputs/',
      'modules/pickers/',
      'modules/display/',
      'modules/blocks/',
      'modules/icons/',
      'modules/conditions/',
    ],
  ],
  ['Components', ['components/']],
  ['Plugin runtime', ['types/UIConfig', 'utils/plugin-', 'utils/file-storage', 'utils/getPlugin']],
  [
    'Hooks and helpers',
    ['hooks/', 'lib/', 'utils/', 'state/', 'types/', 'constants/', 'modules/hotkey/'],
  ],
] as const;

const sectionOf = (file: string) => {
  const path = file.slice(fileURLToPath(new URL('src/', ui)).length);
  const section = sections.find(([, prefixes]) => prefixes.some((p) => path.startsWith(p)));

  if (!section) throw new Error(`tools/ui-exports.ts: add a section for ${path}`);

  return section[0];
};

const list = (names: readonly string[]) =>
  names.length > 5 ? `${names.slice(0, 5).join(', ')}, …` : names.join(', ');

/** How an export reads in the catalog: `<Spinner size show>`, `useFormat()`, `Card.{Header}`. */
const signature = (name: string, isType: boolean, hint: Hint | undefined) => {
  if (!hint) return isType ? `type ${name}` : name;

  if ('fields' in hint) return `type ${name} { ${list(hint.fields)} }`;

  if ('parts' in hint) return `${name}.{${list(hint.parts)}}`;

  const params = hint.params.map((param) => (Array.isArray(param) ? `{ ${list(param)} }` : param));

  if (!/^[A-Z]/.test(name)) return `${name}(${params.join(', ')})`;

  const [props] = hint.params;

  const attributes = Array.isArray(props)
    ? props.slice(0, 5)
    : props?.startsWith('...')
      ? [`{${props}}`]
      : [];

  return `<${[name, ...attributes].join(' ')}>`;
};

const code = (text: string) => `\`${text}\``;

// Padded as oxfmt pads a markdown table, so `vp run check` leaves the file as written.
const tableRows = [
  ['Page', 'Build with', 'Copy'],
  ...pages.map(([kind = '', components = '', screen]) => [
    kind,
    components.split(', ').map(code).join(', '),
    screen ? code(screen) : 'none in core yet',
  ]),
];

const widths = [0, 1, 2].map((column) =>
  Math.max(...tableRows.map((row) => row[column]?.length ?? 0)),
);

const tableRow = (cells: string[]) =>
  `| ${cells.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join(' | ')} |`;

const table = [
  tableRow(tableRows[0] ?? []),
  tableRow(widths.map((width) => '-'.repeat(width))),
  ...tableRows.slice(1).map(tableRow),
];

const catalog = [
  '# erxes-ui catalog',
  '',
  'Generated by `tools/ui-exports.ts` from the doc comments in erxes-ui. Find what you need here',
  'before writing a component, hook or helper, and import it from `erxes-ui`.',
  '',
  '## Pages',
  '',
  "Copy the screen beside each kind. `ui/…` is your plugin's own template; `apps/web/…` is",
  "core's, in the erxes repo on branch `postgre`. The `ui-patterns` skill has the rules.",
  '',
  ...table,
  ...sections.flatMap(([title]) => [
    '',
    `## ${title}`,
    '',
    ...exported
      .filter((entry) => sectionOf(entry.file) === title)
      .map((entry) => `- \`${signature(entry.name, entry.isType, entry.hint)}\` ${entry.doc}`),
  ]),
  '',
];

const header = [
  '# Generated by tools/ui-exports.ts. Plugin UIs depend on every line: a removed one breaks',
  '# them at runtime. Read .agents/skills/plugin-contract before removing any.',
];

await writeFile(
  new URL('exports.txt', ui),
  [
    ...header,
    ...SHARED.map((name) => `shared ${name}`),
    ...exported.map(({ name, isType }) => `${isType ? 'type' : 'value'} ${name}`).toSorted(),
    '',
  ].join('\n'),
);

await writeFile(new URL('CATALOG.md', ui), catalog.join('\n'));
