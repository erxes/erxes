import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  IconRobot,
  IconArrowLeft,
  IconInfoCircle,
  IconSearch,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  Alert,
  Breadcrumb,
  Button,
  Checkbox,
  Label,
  Input,
  Separator,
  Slider,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_AGENT,
  MASTRA_AGENTS,
  MASTRA_AVAILABLE_ERXES_TOOLS,
} from '~/graphql/queries';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';
import { Field, FormSection } from '~/components/FormLayout';
import {
  SelectModel,
  SelectProvider,
  useProviderOptions,
} from '~/components/SelectProviderModel';

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const AgentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    agentId: '',
    description: '',
    instructions: '',
    provider: '',
    model: '',
    toolPolicy: 'all' as 'all' | 'custom',
    allowedTools: [] as string[],
    memoryEnabled: true,
    maxSteps: 10,
    temperature: null as number | null,
    isEnabled: true,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [toolSearch, setToolSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  const toggleModule = (key: string) =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Plugins are expanded by default; track the ones the user collapsed.
  const [collapsedPlugins, setCollapsedPlugins] = useState<Set<string>>(
    new Set(),
  );
  const togglePlugin = (key: string) =>
    setCollapsedPlugins((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const { data: agentData } = useQuery(MASTRA_AGENT, {
    variables: { _id: id },
    skip: !isEdit,
  });
  // Live list of runnable erxes operations (cached server-side), used only when
  // restricting an agent. Fetched lazily — no need to load it for "All tools".
  const { data: availableData, loading: availableLoading } = useQuery(
    MASTRA_AVAILABLE_ERXES_TOOLS,
    { skip: form.toolPolicy !== 'custom' },
  );
  // Shared provider list (configured presets + custom DB providers) — same
  // source the SelectProvider combobox uses.
  const { providers: enabledProviders } = useProviderOptions();

  const [createAgent, { loading: creating }] = useMutation(
    MASTRA_AGENT_CREATE,
    {
      refetchQueries: [{ query: MASTRA_AGENTS }],
      awaitRefetchQueries: true,
      onCompleted: () => navigate('/settings/erxes-agent/agents'),
    },
  );
  const [updateAgent, { loading: updating }] = useMutation(
    MASTRA_AGENT_UPDATE,
    {
      refetchQueries: [{ query: MASTRA_AGENTS }],
      awaitRefetchQueries: true,
      onCompleted: () => navigate('/settings/erxes-agent/agents'),
    },
  );

  // Populate form from saved data — runs once when agent data arrives
  useEffect(() => {
    if (isEdit && agentData?.mastraAgent) {
      const a = agentData.mastraAgent;
      setForm({
        name: a.name || '',
        agentId: a.agentId || '',
        description: a.description || '',
        instructions: a.instructions || '',
        provider: a.provider || '',
        model: a.model || '',
        toolPolicy: a.toolPolicy === 'custom' ? 'custom' : 'all',
        allowedTools: a.allowedTools || [],
        memoryEnabled: a.memoryEnabled ?? true,
        maxSteps: a.maxSteps ?? 10,
        temperature: a.temperature ?? null,
        isEnabled: a.isEnabled ?? true,
      });
      setAutoSlug(false);
    }
  }, [agentData, isEdit]);

  // Built-in (non-erxes) tools, offered alongside operations in the picker.
  // Keep in sync with backend mastra/tools/builtins.ts (BUILTIN_TOOLS keys).
  const BUILTINS = useMemo(
    () => [
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
    ],
    [],
  );

  const operations = availableData?.mastraAvailableErxesTools || [];

  // Nested grouping: plugin → module → operations, driven by each op's
  // plugin/module metadata. Builtins live under a synthetic "Built-in" plugin.
  const nestedTools = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();

    const erxes = operations.map((o: any) => ({
      kind: 'erxes' as const,
      key: o.operation,
      operation: o.operation,
      operationType: o.operationType as string | undefined,
      plugin: o.plugin || 'other',
      module: o.module || 'other',
      description: o.description || o.operation,
    }));
    const builtins = BUILTINS.map((b) => ({
      kind: 'builtin' as const,
      key: `builtin:${b.key}`,
      operation: b.key,
      operationType: undefined as string | undefined,
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

    const plugins = new Map<string, Map<string, any[]>>();
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
          items: [...items].sort((x: any, y: any) =>
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
  }, [operations, BUILTINS, toolSearch]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleNameChange = (v: string) => {
    set('name', v);
    if (autoSlug) set('agentId', toSlug(v));
  };

  // ── Allowlist scope helpers ───────────────────────────────────────────────
  // allowedTools entries: an operation name, "plugin:<name>", "module:<name>",
  // or "builtin:<key>". A wildcard covers all its children.
  const allowed = form.allowedTools;
  const hasEntry = (e: string) => allowed.includes(e);
  const setAllowed = (next: string[]) => set('allowedTools', next);
  const toggleEntry = (entry: string) =>
    setAllowed(
      hasEntry(entry)
        ? allowed.filter((e) => e !== entry)
        : [...allowed, entry],
    );

  const pluginCovered = (pluginKey: string) =>
    pluginKey !== '__builtin__' && hasEntry(`plugin:${pluginKey}`);
  const moduleCovered = (pluginKey: string, module: string) =>
    pluginCovered(pluginKey) || hasEntry(`module:${module}`);
  // Builtins are only ever selected by their explicit key (never by a wildcard).
  const opSelected = (t: any) =>
    t.kind === 'builtin'
      ? hasEntry(t.key)
      : hasEntry(t.operation) || moduleCovered(t.plugin, t.module);

  const toggleOp = (t: any) =>
    t.kind === 'builtin' ? toggleEntry(t.key) : toggleEntry(t.operation);

  // Toggle "all operations in a plugin" via a plugin:<name> wildcard. Enabling
  // strips now-redundant child op/module entries so the allowlist stays minimal.
  const toggleSelectPlugin = (pluginKey: string, modules: any[]) => {
    const wc = `plugin:${pluginKey}`;
    if (hasEntry(wc)) return setAllowed(allowed.filter((e) => e !== wc));
    const childOps = new Set<string>();
    const childMods = new Set<string>();
    for (const m of modules) {
      childMods.add(`module:${m.module}`);
      for (const it of m.items) childOps.add(it.operation);
    }
    setAllowed([
      ...allowed.filter((e) => !childOps.has(e) && !childMods.has(e)),
      wc,
    ]);
  };

  // Toggle "all operations in a module" via a module:<name> wildcard.
  const toggleSelectModule = (module: string, items: any[]) => {
    const wc = `module:${module}`;
    if (hasEntry(wc)) return setAllowed(allowed.filter((e) => e !== wc));
    const childOps = new Set(items.map((it: any) => it.operation));
    setAllowed([...allowed.filter((e) => !childOps.has(e)), wc]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model) return;
    if (isEdit) {
      updateAgent({ variables: { _id: id, doc: form } });
    } else {
      createAgent({ variables: { doc: form } });
    }
  };

  const isSaving = creating || updating;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/erxes-agent/agents">
                    <IconRobot />
                    Agents
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {isEdit ? 'Edit Agent' : 'New Agent'}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/erxes-agent/agents">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button
            type="submit"
            form="agent-form"
            disabled={isSaving || !form.model}
          >
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <form
          id="agent-form"
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-4"
        >
          {/* Basic info */}
          <FormSection title="Basic Info">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Customer Support Agent"
                required
              />
            </Field>

            <Field
              label="Agent ID *"
              hint="Unique identifier used by the bot endpoint. Auto-generated from name."
            >
              <Input
                value={form.agentId}
                onChange={(e) => {
                  setAutoSlug(false);
                  set('agentId', e.target.value);
                }}
                placeholder="customer-support"
                className="font-mono text-sm"
                required
              />
            </Field>

            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What this agent does"
              />
            </Field>

            <Field
              label="System Instructions *"
              hint="This is the system prompt sent to the LLM on every conversation."
            >
              <Textarea
                value={form.instructions}
                onChange={(e: any) => set('instructions', e.target.value)}
                placeholder="You are a helpful customer support agent for…"
                rows={6}
                required
              />
            </Field>
          </FormSection>

          {/* Model */}
          <FormSection
            title="AI Model"
            description="Select the provider and model that powers this agent."
          >
            {enabledProviders.length === 0 ? (
              <Alert>
                <IconInfoCircle className="size-4" />
                <Alert.Title>No providers configured</Alert.Title>
                <Alert.Description>
                  <Link
                    to="/settings/erxes-agent/providers"
                    className="underline underline-offset-4"
                  >
                    Add a provider
                  </Link>{' '}
                  before creating an agent.
                </Alert.Description>
              </Alert>
            ) : (
              <>
                <Field label="Provider *">
                  <SelectProvider
                    value={form.provider}
                    onValueChange={(v) => {
                      set('provider', v);
                      set('model', '');
                    }}
                  />
                </Field>

                <Field
                  label="Model *"
                  hint="Listed live from the provider's model API."
                >
                  <SelectModel
                    provider={form.provider}
                    value={form.model}
                    onValueChange={(v) => set('model', v)}
                  />
                </Field>
              </>
            )}
          </FormSection>

          {/* Tool Access */}
          <FormSection
            title="Tool Access"
            description="Control which erxes operations this agent can search and run."
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Restrict tool access</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {form.toolPolicy === 'custom'
                    ? 'This agent can only use the operations selected below.'
                    : 'Off: the agent can search and run any erxes operation (reads and writes).'}
                </p>
              </div>
              <Switch
                checked={form.toolPolicy === 'custom'}
                onCheckedChange={(v: boolean) =>
                  set('toolPolicy', v ? 'custom' : 'all')
                }
              />
            </div>

            {form.toolPolicy === 'all' ? (
              <Alert>
                <IconInfoCircle className="size-4" />
                <Alert.Title>Full access</Alert.Title>
                <Alert.Description>
                  The agent discovers operations on demand and can run any query
                  or mutation across every installed erxes service. Turn on
                  “Restrict tool access” to limit it to specific operations.
                </Alert.Description>
              </Alert>
            ) : (
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
                      onClick={() => setAllowed([])}
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    placeholder="Search operations…"
                    className="pl-8 h-8 text-sm"
                  />
                </div>

                {availableLoading && operations.length === 0 ? (
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
                              (n, m) =>
                                n +
                                m.items.filter((t: any) => opSelected(t))
                                  .length,
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
                                    className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
                                      pluginOpen ? 'rotate-90' : ''
                                    }`}
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
                                    !!toolSearch.trim() ||
                                    expandedModules.has(key);
                                  const modCovered =
                                    !isBuiltin &&
                                    moduleCovered(pluginKey, module);
                                  const selectedCount = items.filter((t: any) =>
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
                                                toggleSelectModule(
                                                  module,
                                                  items,
                                                )
                                              }
                                            />
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => toggleModule(key)}
                                            className="flex items-center gap-1.5 min-w-0"
                                          >
                                            <IconChevronRight
                                              className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
                                                open ? 'rotate-90' : ''
                                              }`}
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
                                          {items.map((t: any) => {
                                            const covered =
                                              t.kind === 'erxes' &&
                                              moduleCovered(t.plugin, t.module);
                                            return (
                                              <label
                                                key={t.key}
                                                className={`flex items-start gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-accent ${
                                                  covered
                                                    ? 'opacity-60 cursor-default'
                                                    : 'cursor-pointer'
                                                }`}
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
                                                        className={`text-[10px] px-1.5 py-0.5 rounded-sm shrink-0 ${
                                                          t.operationType ===
                                                          'mutation'
                                                            ? 'bg-warning/10 text-warning'
                                                            : 'bg-info/10 text-info'
                                                        }`}
                                                      >
                                                        {t.operationType ===
                                                        'mutation'
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
            )}
          </FormSection>

          {/* Behavior */}
          <FormSection title="Behavior">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Conversation Memory</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remembers previous messages per conversation thread
                </p>
              </div>
              <Switch
                checked={form.memoryEnabled}
                onCheckedChange={(v) => set('memoryEnabled', v)}
              />
            </div>

            <Separator />

            <Field
              label="Max Tool Steps"
              hint="Max consecutive tool calls the agent can make (default: 10)"
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.maxSteps}
                  onChange={(e) =>
                    set('maxSteps', parseInt(e.target.value) || 10)
                  }
                  className="w-24"
                />
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <IconInfoCircle className="size-4 text-muted-foreground" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-xs">
                      Prevents infinite loops. Raise this if the agent
                      frequently stops mid-task.
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </div>
            </Field>

            <Separator />

            <Field
              label="Temperature"
              hint="Sampling randomness (0–2). Some models only accept a fixed value — e.g. Kimi thinking models require 1."
            >
              <div className="flex items-center gap-3">
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[form.temperature ?? 1]}
                  onValueChange={([v]: number[]) => set('temperature', v)}
                  className="flex-1 max-w-xs"
                />
                <span className="w-16 text-sm tabular-nums text-muted-foreground">
                  {form.temperature != null
                    ? form.temperature.toFixed(1)
                    : 'Default'}
                </span>
                {form.temperature != null && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => set('temperature', null)}
                  >
                    Use default
                  </Button>
                )}
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <IconInfoCircle className="size-4 text-muted-foreground" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-xs">
                      Lower values give more deterministic answers, higher
                      values more creative ones. If the provider rejects the
                      configured value (e.g. &quot;only 1 is allowed&quot;), set
                      it to the value the model requires.
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </div>
            </Field>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disabled agents won't respond to bot webhook requests
                </p>
              </div>
              <Switch
                checked={form.isEnabled}
                onCheckedChange={(v) => set('isEnabled', v)}
              />
            </div>
          </FormSection>

          {/* Mobile submit */}
          <div className="flex gap-3 pb-4 sm:hidden">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agent'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/settings/erxes-agent/agents">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
