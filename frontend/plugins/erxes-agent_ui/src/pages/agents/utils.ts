import { IErxesTool, IToolItem, IToolPluginGroup } from './types';

// Slugify a name into an agentId. Names with no ASCII alphanumerics (e.g.
// "日本語", "!!!") would otherwise slug to an empty string and fail the
// required-field check with no visible hint — fall back to a non-empty default.
export const toSlug = (name: string, fallback = 'agent'): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || fallback;

// Built-in (non-erxes) tools, offered alongside operations in the picker.
// Keep in sync with backend mastra/tools/builtins.ts (BUILTIN_TOOLS keys).
export const BUILTIN_TOOLS: { key: string; description: string }[] = [
  { key: 'webSearch', description: 'Web search (DuckDuckGo)' },
  { key: 'fetchUrl', description: 'Fetch a web page as readable text' },
  { key: 'calculator', description: 'Evaluate a math expression' },
  {
    key: 'renderChart',
    description: 'Render a bar / line / area / pie chart in chat',
  },
  {
    key: 'readAttachment',
    description: 'Read a file or image (text, PDF, images)',
  },
  {
    key: 'companyKnowledge',
    description: 'Search indexed company knowledge',
  },
];

/**
 * Nested grouping: plugin → module → operations, driven by each op's
 * plugin/module metadata. Builtins live under a synthetic "Built-in" plugin.
 */
export const buildNestedTools = (
  operations: IErxesTool[],
  search: string,
): IToolPluginGroup[] => {
  const q = search.trim().toLowerCase();

  const erxes: IToolItem[] = operations.map((o) => ({
    kind: 'erxes',
    key: o.operation,
    operation: o.operation,
    operationType: o.operationType ?? undefined,
    plugin: o.plugin || 'other',
    module: o.module || 'other',
    description: o.description || o.operation,
  }));
  const builtins: IToolItem[] = BUILTIN_TOOLS.map((b) => ({
    kind: 'builtin',
    key: `builtin:${b.key}`,
    operation: b.key,
    operationType: undefined,
    plugin: '__builtin__',
    module: 'tools',
    description: b.description,
  }));

  const all = [...builtins, ...erxes];
  const filtered = q
    ? all.filter(
        (t) =>
          t.operation.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.plugin.toLowerCase().includes(q) ||
          t.module.toLowerCase().includes(q),
      )
    : all;

  const plugins = new Map<string, Map<string, IToolItem[]>>();
  for (const t of filtered) {
    if (!plugins.has(t.plugin)) plugins.set(t.plugin, new Map());
    const mods = plugins.get(t.plugin)!;
    if (!mods.has(t.module)) mods.set(t.module, []);
    mods.get(t.module)!.push(t);
  }

  // Built-in first, then plugins alphabetically.
  const pluginEntries = [...plugins.entries()].sort(([a], [b]) => {
    if (a === '__builtin__') return -1;
    if (b === '__builtin__') return 1;
    return a.localeCompare(b);
  });

  return pluginEntries.map(([pluginKey, mods]) => {
    const modules = [...mods.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, items]) => ({
        module,
        items: [...items].sort((x, y) =>
          x.operation.localeCompare(y.operation),
        ),
      }));
    const count = modules.reduce((n, m) => n + m.items.length, 0);
    return {
      pluginKey,
      plugin: pluginKey === '__builtin__' ? 'Built-in' : pluginKey,
      isBuiltin: pluginKey === '__builtin__',
      count,
      modules,
    };
  });
};
