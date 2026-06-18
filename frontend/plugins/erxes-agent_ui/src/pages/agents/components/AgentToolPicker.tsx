import { useMemo, useState } from 'react';
import { IconSearch, IconChevronRight } from '@tabler/icons-react';
import { Button, Checkbox, Input, cn } from 'erxes-ui';
import { IErxesTool, IToolItem, IToolModuleGroup } from '../types';
import { buildNestedTools } from '../utils';

interface AgentToolPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  operations: IErxesTool[];
  loading: boolean;
}

/**
 * Allowlist picker for an agent's tool access. Entries are an operation name,
 * "plugin:<name>", "module:<name>", or "builtin:<key>"; a wildcard covers all
 * its children. Extracted from AgentFormPage so the form stays thin.
 */
export const AgentToolPicker = ({
  value,
  onChange,
  operations,
  loading,
}: AgentToolPickerProps) => {
  const [toolSearch, setToolSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  // Plugins are expanded by default; track the ones the user collapsed.
  const [collapsedPlugins, setCollapsedPlugins] = useState<Set<string>>(
    new Set(),
  );

  const toggleModule = (key: string) =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const togglePlugin = (key: string) =>
    setCollapsedPlugins((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const nestedTools = useMemo(
    () => buildNestedTools(operations, toolSearch),
    [operations, toolSearch],
  );

  const allowed = value;
  const hasEntry = (e: string) => allowed.includes(e);
  const toggleEntry = (entry: string) =>
    onChange(
      hasEntry(entry)
        ? allowed.filter((e) => e !== entry)
        : [...allowed, entry],
    );

  const pluginCovered = (pluginKey: string) =>
    pluginKey !== '__builtin__' && hasEntry(`plugin:${pluginKey}`);
  const moduleCovered = (pluginKey: string, module: string) =>
    pluginCovered(pluginKey) || hasEntry(`module:${module}`);
  // Builtins are only ever selected by their explicit key (never by a wildcard).
  const opSelected = (t: IToolItem) =>
    t.kind === 'builtin'
      ? hasEntry(t.key)
      : hasEntry(t.operation) || moduleCovered(t.plugin, t.module);

  const toggleOp = (t: IToolItem) =>
    t.kind === 'builtin' ? toggleEntry(t.key) : toggleEntry(t.operation);

  // Toggle "all operations in a plugin" via a plugin:<name> wildcard. Enabling
  // strips now-redundant child op/module entries so the allowlist stays minimal.
  const toggleSelectPlugin = (
    pluginKey: string,
    modules: IToolModuleGroup[],
  ) => {
    const wc = `plugin:${pluginKey}`;
    if (hasEntry(wc)) {
      onChange(allowed.filter((e) => e !== wc));
      return;
    }
    const childOps = new Set<string>();
    const childMods = new Set<string>();
    for (const m of modules) {
      childMods.add(`module:${m.module}`);
      for (const it of m.items) childOps.add(it.operation);
    }
    onChange([
      ...allowed.filter((e) => !childOps.has(e) && !childMods.has(e)),
      wc,
    ]);
  };

  // Toggle "all operations in a module" via a module:<name> wildcard.
  const toggleSelectModule = (module: string, items: IToolItem[]) => {
    const wc = `module:${module}`;
    if (hasEntry(wc)) {
      onChange(allowed.filter((e) => e !== wc));
      return;
    }
    const childOps = new Set(items.map((it) => it.operation));
    onChange([...allowed.filter((e) => !childOps.has(e)), wc]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {allowed.length > 0
            ? `${allowed.length} rule${
                allowed.length !== 1 ? 's' : ''
              } selected`
            : 'Nothing selected yet — this agent will have no tools.'}
        </p>
        {allowed.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={toolSearch}
          onChange={(e) => setToolSearch(e.target.value)}
          placeholder="Search operations…"
          className="pl-8 h-8 text-sm"
        />
      </div>

      {loading && operations.length === 0 ? (
        <p className="text-sm text-muted-foreground py-1">
          Loading operations…
        </p>
      ) : nestedTools.length === 0 ? (
        <p className="text-sm text-muted-foreground py-1">
          {operations.length === 0
            ? 'No operations found. Make sure the erxes gateway is reachable and configured in General Settings.'
            : 'No operations match your search.'}
        </p>
      ) : (
        <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
          {nestedTools.map(
            ({ pluginKey, plugin, isBuiltin, count, modules }) => {
              const pluginOpen =
                !!toolSearch.trim() || !collapsedPlugins.has(plugin);
              const allCovered = pluginCovered(pluginKey);
              const pluginSelected = allCovered
                ? count
                : modules.reduce(
                    (n, m) => n + m.items.filter((t) => opSelected(t)).length,
                    0,
                  );
              return (
                <div key={pluginKey}>
                  <div className="w-full flex items-center justify-between gap-2 px-1 mb-1">
                    <span className="flex items-center gap-1.5 min-w-0">
                      {!isBuiltin && (
                        <Checkbox
                          checked={allCovered}
                          onCheckedChange={() =>
                            toggleSelectPlugin(pluginKey, modules)
                          }
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => togglePlugin(plugin)}
                        className="flex items-center gap-1.5 min-w-0 hover:opacity-80"
                      >
                        <IconChevronRight
                          className={cn(
                            'size-3.5 shrink-0 text-muted-foreground transition-transform',
                            pluginOpen && 'rotate-90',
                          )}
                        />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {plugin}
                        </span>
                        <span className="normal-case font-normal text-[10px] text-muted-foreground">
                          {count}
                        </span>
                      </button>
                    </span>
                    {pluginSelected > 0 && (
                      <span className="text-[10px] text-primary shrink-0">
                        {allCovered ? 'all' : pluginSelected} selected
                      </span>
                    )}
                  </div>
                  {pluginOpen && (
                    <div className="space-y-1">
                      {modules.map(({ module, items }) => {
                        const key = `${pluginKey}:${module}`;
                        const open =
                          !!toolSearch.trim() || expandedModules.has(key);
                        const modCovered =
                          !isBuiltin && moduleCovered(pluginKey, module);
                        const selectedCount = items.filter((t) =>
                          opSelected(t),
                        ).length;
                        return (
                          <div
                            key={key}
                            className="rounded-md border border-border/60"
                          >
                            <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md hover:bg-accent">
                              <span className="flex items-center gap-1.5 min-w-0">
                                {!isBuiltin && (
                                  <Checkbox
                                    checked={modCovered}
                                    disabled={allCovered}
                                    onCheckedChange={() =>
                                      toggleSelectModule(module, items)
                                    }
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleModule(key)}
                                  className="flex items-center gap-1.5 min-w-0"
                                >
                                  <IconChevronRight
                                    className={cn(
                                      'size-3.5 shrink-0 text-muted-foreground transition-transform',
                                      open && 'rotate-90',
                                    )}
                                  />
                                  <span className="text-sm font-medium capitalize truncate">
                                    {module}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground shrink-0">
                                    {items.length}
                                  </span>
                                </button>
                              </span>
                              {selectedCount > 0 && (
                                <span className="text-[10px] text-primary shrink-0">
                                  {selectedCount} selected
                                </span>
                              )}
                            </div>
                            {open && (
                              <div className="px-2 pb-1.5 space-y-0.5">
                                {items.map((t) => {
                                  const covered =
                                    t.kind === 'erxes' &&
                                    moduleCovered(t.plugin, t.module);
                                  return (
                                    <label
                                      key={t.key}
                                      className={cn(
                                        'flex items-start gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-accent',
                                        covered
                                          ? 'opacity-60 cursor-default'
                                          : 'cursor-pointer',
                                      )}
                                    >
                                      <Checkbox
                                        className="mt-0.5"
                                        checked={opSelected(t)}
                                        disabled={covered}
                                        onCheckedChange={() =>
                                          covered ? null : toggleOp(t)
                                        }
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium first-letter:uppercase">
                                            {t.description}
                                          </span>
                                          {t.operationType && (
                                            <span
                                              className={cn(
                                                'text-[10px] px-1.5 py-0.5 rounded-sm shrink-0',
                                                t.operationType === 'mutation'
                                                  ? 'bg-warning/10 text-warning'
                                                  : 'bg-info/10 text-info',
                                              )}
                                            >
                                              {t.operationType === 'mutation'
                                                ? 'write'
                                                : 'read'}
                                            </span>
                                          )}
                                        </div>
                                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                                          {t.operation}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
};
