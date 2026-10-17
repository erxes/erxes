import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconChevronDown,
  IconPuzzle,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Collapsible,
  Input,
  Skeleton,
  ToggleGroup,
  Tooltip,
  cn,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';

import {
  AGENTS_TOOLS,
  type IAgentsTool,
  type IAgentsToolsData,
} from '@/agent/graphql/tools';
import { AppPath } from '@/types/paths/AppPath';

type IFilter = 'all' | 'available' | 'asks-first';

const PLUGIN_LABELS: Record<string, string> = {
  core: 'Core',
  sales: 'Sales',
  frontline: 'Frontline',
};

const pluginLabel = (plugin: string): string =>
  PLUGIN_LABELS[plugin] ??
  plugin.charAt(0).toUpperCase() + plugin.slice(1);

/** `findWithChild` → `Find with child`; `cpUsers` → `Cp users`. */
const humanizeSegment = (segment: string): string =>
  segment
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()) ||
  segment;

/** `deal.findOne` → { module: 'deal', action: 'findOne' }. */
const splitPath = (path: string): { module: string; action: string } => {
  const dot = path.lastIndexOf('.');
  return dot === -1
    ? { module: '', action: path }
    : { module: path.slice(0, dot), action: path.slice(dot + 1) };
};

const ToolRow = ({ tool }: { tool: IAgentsTool }) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent.capabilities-page' });
  const [open, setOpen] = useState(false);
  const fields = tool.inputFields ?? [];

  const row = (
    <div
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left',
        !tool.allowed && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">
          {humanizeSegment(splitPath(tool.path ?? '').action)}
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs text-muted-foreground',
            !open && 'line-clamp-2',
          )}
        >
          {tool.description}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/70">
          {tool.path}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {tool.method === 'mutation' ? (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400"
          >
            {t('write', 'Write')}
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            {t('read', 'Read')}
          </span>
        )}
        {tool.requiresApproval && (
          <Badge variant="secondary" className="text-[10px] font-medium">
            {t('asks-first', 'Asks first')}
          </Badge>
        )}
        {!tool.allowed && (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-default text-[10px] font-medium text-muted-foreground"
                >
                  {t('no-access', 'No access')}
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {t(
                  'missing-permission',
                  'Requires the "{{action}}" permission',
                  { action: tool.permission?.action ?? '—' },
                )}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </div>
    </div>
  );

  if (fields.length === 0) {
    return <div>{row}</div>;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button type="button" className="w-full">
          {row}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="border-t bg-muted/30 px-4 py-2.5">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {t('inputs', 'Inputs')}
          </p>
          <ul className="space-y-1">
            {fields.map((field) => (
              <li
                key={field.name}
                className="flex items-baseline gap-2 text-xs"
              >
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                  {field.name}
                  {field.required ? '*' : ''}
                </code>
                <span className="text-muted-foreground">
                  {field.type || 'any'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

/**
 * `/agent/capabilities` — every agent-admitted tool across the loaded
 * plugins, grouped by plugin, with approval and per-user access flags.
 */
export const AgentCapabilitiesPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<IFilter>('all');

  const { data, loading, error, refetch } =
    useQuery<IAgentsToolsData>(AGENTS_TOOLS);

  const tools = data?.agentsTools?.tools ?? [];
  const unavailablePlugins = data?.agentsTools?.unavailablePlugins ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tools.filter((tool) => {
      if (filter === 'available' && !tool.allowed) {
        return false;
      }
      if (filter === 'asks-first' && !tool.requiresApproval) {
        return false;
      }
      if (!query) {
        return true;
      }
      return `${tool.description ?? ''} ${tool.id} ${tool.path ?? ''}`
        .toLowerCase()
        .includes(query);
    });
  }, [tools, search, filter]);

  const grouped = useMemo(() => {
    const byPlugin = new Map<string, Map<string, IAgentsTool[]>>();

    for (const tool of filtered) {
      const pluginBucket = byPlugin.get(tool.plugin) ?? new Map();
      const moduleKey = splitPath(tool.path ?? '').module || '_root';
      const list = pluginBucket.get(moduleKey) ?? [];

      list.push(tool);
      pluginBucket.set(moduleKey, list);
      byPlugin.set(tool.plugin, pluginBucket);
    }

    return [...byPlugin.entries()].map(([plugin, moduleMap]) => ({
      plugin,
      modules: [...moduleMap.entries()].map(([module, moduleTools]) => ({
        module,
        tools: moduleTools,
      })),
    }));
  }, [filtered]);

  const approvalCount = tools.filter((tool) => tool.requiresApproval).length;
  const unavailableCount = tools.filter((tool) => !tool.allowed).length;

  return (
    <div className="flex h-full flex-col text-sm">
      <PageHeader>
        <PageHeader.Start>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t('back-to-chat', 'Back to chat')}
            asChild
          >
            <Link to={`/${AppPath.Agent}`}>
              <IconArrowLeft />
            </Link>
          </Button>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={`/${AppPath.Agent}`}>
                    <IconSparkles />
                    {t('title', 'AI Agent')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>
                  {t('capabilities', 'Capabilities')}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End className="gap-1.5">
          <Button variant="ghost" asChild>
            <Link to={`/${AppPath.Agent}`}>
              <IconArrowLeft />
              <span className="hidden sm:inline">
                {t('back-to-chat', 'Back to chat')}
              </span>
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <IconAlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {t('capabilities-load-error', "Couldn't load the capabilities list.")}
              </p>
              <p className="text-xs text-destructive/80">{error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {t('retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconPuzzle className="size-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">
                      {t('capabilities', 'Capabilities')}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'capabilities-summary',
                        '{{total}} tools · {{approval}} ask before running · {{unavailable}} not available to you',
                        {
                          total: tools.length,
                          approval: approvalCount,
                          unavailable: unavailableCount,
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative min-w-0 flex-1">
                    <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t(
                        'capabilities-search',
                        'Search capabilities…',
                      )}
                      aria-label={t(
                        'capabilities-search',
                        'Search capabilities',
                      )}
                      className="h-9 pl-8"
                    />
                  </div>
                  <ToggleGroup
                    type="single"
                    value={filter}
                    onValueChange={(value) => {
                      if (value) {
                        setFilter(value as IFilter);
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroup.Item value="all" className="h-9 px-3 text-xs">
                      {t('capabilities-all', 'All')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      value="available"
                      className="h-9 px-3 text-xs"
                    >
                      {t('capabilities-available', 'Available to me')}
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      value="asks-first"
                      className="h-9 px-3 text-xs"
                    >
                      {t('capabilities-asks-first', 'Asks first')}
                    </ToggleGroup.Item>
                  </ToggleGroup>
                </div>

                {unavailablePlugins.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('capabilities-unreachable', "Couldn't reach:")}{' '}
                    {unavailablePlugins.map(pluginLabel).join(', ')}
                  </p>
                )}
              </div>

              {tools.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <IconPuzzle className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'capabilities-empty',
                      'No tools are enabled for this workspace yet.',
                    )}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <IconSearch className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'capabilities-no-match',
                      'No capabilities match this filter.',
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {grouped.map(({ plugin, modules }) => (
                    <section key={plugin}>
                      <h2 className="mb-2 flex items-baseline gap-2 text-xs font-medium text-muted-foreground">
                        {pluginLabel(plugin)}
                        <span className="font-normal text-muted-foreground/60">
                          {modules.reduce((n, m) => n + m.tools.length, 0)}
                        </span>
                      </h2>
                      <div className="space-y-3">
                        {modules.map(({ module, tools: moduleTools }) => (
                          <div key={module}>
                            <h3 className="mb-1.5 px-1 text-[11px] font-medium text-muted-foreground/80">
                              {module === '_root'
                                ? pluginLabel(plugin)
                                : humanizeSegment(module)}
                            </h3>
                            <div className="divide-y rounded-xl border">
                              {moduleTools.map((tool) => (
                                <ToolRow key={tool.id} tool={tool} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
