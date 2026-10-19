import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCube,
  IconLock,
  IconMessages,
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
  cn,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  AGENTS_TOOLS,
  type IAgentsTool,
  type IAgentsToolsData,
} from '@/agent/graphql/tools';
import { AppPath } from '@/types/paths/AppPath';

type ToolFilter = 'all' | 'query' | 'mutation' | 'approval';
const PAGE_SIZE = 20;

const pluginLabel = (plugin: string): string =>
  plugin.charAt(0).toUpperCase() + plugin.slice(1);

const toolLabel = (tool: IAgentsTool): string =>
  (tool.path || tool.id)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_.]/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());

const PluginIcon = ({ plugin }: { plugin: string }) => {
  const Icon =
    plugin === 'core'
      ? IconCube
      : plugin === 'sales'
      ? IconBriefcase
      : plugin === 'frontline'
      ? IconMessages
      : IconPuzzle;
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
      <Icon className="size-6" stroke={1.5} />
    </span>
  );
};

const ToolRow = ({ tool }: { tool: IAgentsTool }) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useState(false);
  const fields = tool.inputFields ?? [];
  const isWrite = tool.method === 'mutation';
  const hasDescription =
    tool.description && !tool.description.startsWith(`${tool.path}(`);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3.5 text-left sm:px-5"
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              isWrite ? 'bg-amber-500' : 'bg-muted-foreground/40',
            )}
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {toolLabel(tool)}
          </span>
          {tool.requiresApproval && (
            <IconLock
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label={t('capabilities-asks-first', 'Asks first')}
            />
          )}
          <span className="w-10 shrink-0 text-right text-xs font-normal text-muted-foreground">
            {isWrite
              ? t('capabilities-write', 'Write')
              : t('capabilities-read', 'Read')}
          </span>
          <IconChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground/60 transition-transform',
              open && 'rotate-180',
            )}
          />
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="space-y-5 border-t bg-muted/20 px-5 py-5 sm:px-9">
          {hasDescription && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {isWrite
                ? t('capabilities-write', 'Write')
                : t('capabilities-read', 'Read')}
            </Badge>
            {tool.requiresApproval && (
              <Badge variant="secondary">
                <IconLock className="mr-1 size-3" />
                {t('capabilities-asks-first', 'Asks first')}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              {t('capabilities-api-operation', 'API operation')}
            </h3>
            <code className="block break-all rounded-lg border bg-background px-3 py-2.5 font-mono text-xs leading-relaxed">
              {hasDescription ? tool.path : tool.description || tool.path}
            </code>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              {t('capabilities-inputs', 'Inputs')}{' '}
              <span className="ml-1 tabular-nums text-muted-foreground/60">
                {fields.length}
              </span>
            </h3>
            {fields.length ? (
              <dl className="divide-y rounded-lg border bg-background px-3">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-xs"
                  >
                    <dt className="break-all font-mono">
                      {field.name}
                      {field.required && (
                        <span className="ml-1 text-amber-600 dark:text-amber-400">
                          *
                        </span>
                      )}
                    </dt>
                    <dd className="break-all font-mono text-muted-foreground">
                      {field.type || 'Unknown'}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('capabilities-no-inputs', 'No inputs required.')}
              </p>
            )}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

export const AgentCapabilitiesPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ToolFilter>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [showAllPlugins, setShowAllPlugins] = useState(false);
  const { data, loading, error, refetch } =
    useQuery<IAgentsToolsData>(AGENTS_TOOLS);
  const tools = data?.agentsTools?.tools ?? [];
  const unavailablePlugins = data?.agentsTools?.unavailablePlugins ?? [];

  const plugins = useMemo(() => {
    const grouped = new Map<string, IAgentsTool[]>();
    for (const tool of tools) {
      const bucket = grouped.get(tool.plugin) ?? [];
      bucket.push(tool);
      grouped.set(tool.plugin, bucket);
    }
    return [...grouped.entries()].sort(([a], [b]) =>
      a === b ? 0 : a === 'core' ? -1 : b === 'core' ? 1 : a.localeCompare(b),
    );
  }, [tools]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tools.filter((tool) => {
      if (selectedPlugin && tool.plugin !== selectedPlugin) return false;
      if (filter === 'approval' && !tool.requiresApproval) return false;
      if (
        (filter === 'query' || filter === 'mutation') &&
        tool.method !== filter
      )
        return false;
      return (
        !query ||
        `${pluginLabel(tool.plugin)} ${toolLabel(tool)} ${tool.path ?? ''} ${
          tool.description ?? ''
        }`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [tools, search, filter, selectedPlugin]);

  const matchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tool of filtered)
      counts.set(tool.plugin, (counts.get(tool.plugin) ?? 0) + 1);
    return counts;
  }, [filtered]);
  const matchingPlugins = plugins.filter(([plugin]) => matchCounts.has(plugin));
  const visiblePlugins =
    showAllPlugins || search.trim()
      ? matchingPlugins
      : matchingPlugins.slice(0, 6);
  const approvalCount = tools.filter((tool) => tool.requiresApproval).length;
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const pageTools = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );
  const selectedTools =
    plugins.find(([plugin]) => plugin === selectedPlugin)?.[1] ?? [];
  const filtering = Boolean(search.trim()) || filter !== 'all';
  const pluginDescription = (plugin: string): string => {
    if (plugin === 'core')
      return t(
        'capabilities-core-description',
        'Contacts, products, and workspace management',
      );
    if (plugin === 'sales')
      return t(
        'capabilities-sales-description',
        'Deals, pipelines, and sales activity',
      );
    if (plugin === 'frontline')
      return t(
        'capabilities-frontline-description',
        'Conversations, channels, and support tickets',
      );
    return t(
      'capabilities-other-description',
      'Tools available from this workspace plugin',
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col text-sm">
      <PageHeader>
        <PageHeader.Start>
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
        <PageHeader.End>
          <Button variant="ghost" asChild>
            <Link to={`/${AppPath.Agent}`}>
              <IconArrowLeft />
              {t('back-to-chat', 'Back to chat')}
            </Link>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-10 sm:py-12">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="mb-8 h-20 w-2/3" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <IconAlertCircle className="size-8 text-destructive" />
              <p>
                {t(
                  'capabilities-load-error',
                  "Couldn't load the capabilities list.",
                )}
              </p>
              <p className="text-xs text-muted-foreground">{error.message}</p>
              <Button variant="outline" onClick={() => refetch()}>
                {t('retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              {selectedPlugin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-6 -ml-2 text-muted-foreground"
                  onClick={() => {
                    setSelectedPlugin(null);
                    setFilter('all');
                    setPage(0);
                  }}
                >
                  <IconArrowLeft className="size-4" />
                  {t('capabilities-all-plugins', 'All plugins')}
                </Button>
              )}
              <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  {selectedPlugin && <PluginIcon plugin={selectedPlugin} />}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {selectedPlugin
                        ? t('capabilities-plugin-tools', 'Plugin tools')
                        : t('capabilities-workspace', 'Your agent’s toolkit')}
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      {selectedPlugin
                        ? pluginLabel(selectedPlugin)
                        : t('capabilities', 'Capabilities')}
                    </h1>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      {selectedPlugin
                        ? pluginDescription(selectedPlugin)
                        : t(
                            'capabilities-overview-description',
                            'Explore what your agent can do across your workspace. Choose a plugin to browse its tools.',
                          )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 pt-1 sm:gap-8">
                  <div>
                    <p className="text-2xl font-semibold tabular-nums tracking-tight">
                      {selectedPlugin ? selectedTools.length : tools.length}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('capabilities-tools-label', 'Available tools')}
                    </p>
                  </div>
                  {!selectedPlugin && (
                    <div className="border-l pl-6 sm:pl-8">
                      <p className="text-2xl font-semibold tabular-nums tracking-tight">
                        {plugins.length}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('capabilities-plugins-label', 'Plugins')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(0);
                    }}
                    placeholder={
                      selectedPlugin
                        ? t('capabilities-search-tools', 'Search tools…')
                        : t(
                            'capabilities-search-plugins',
                            'Search plugins or tools…',
                          )
                    }
                    aria-label={t('capabilities-search', 'Search capabilities')}
                    className="h-10 bg-muted/20 pl-9"
                  />
                </div>
                <ToggleGroup
                  type="single"
                  value={filter}
                  className="justify-start gap-1"
                  onValueChange={(value) => {
                    if (
                      value === 'all' ||
                      value === 'query' ||
                      value === 'mutation' ||
                      value === 'approval'
                    ) {
                      setFilter(value);
                      setPage(0);
                    }
                  }}
                >
                  <ToggleGroup.Item value="all" className="h-9 px-3 text-xs">
                    {t('capabilities-all', 'All')}
                  </ToggleGroup.Item>
                  {selectedPlugin && (
                    <ToggleGroup.Item
                      value="query"
                      className="h-9 px-3 text-xs"
                    >
                      {t('capabilities-read', 'Read')}
                    </ToggleGroup.Item>
                  )}
                  {selectedPlugin && (
                    <ToggleGroup.Item
                      value="mutation"
                      className="h-9 px-3 text-xs"
                    >
                      {t('capabilities-write', 'Write')}
                    </ToggleGroup.Item>
                  )}
                  <ToggleGroup.Item
                    value="approval"
                    className="h-9 gap-1.5 px-3 text-xs"
                  >
                    <IconLock className="size-3" />
                    {t('capabilities-asks-first', 'Asks first')}
                  </ToggleGroup.Item>
                </ToggleGroup>
              </div>

              {unavailablePlugins.length > 0 && (
                <p
                  role="status"
                  className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <IconAlertCircle className="size-4" />
                  {t('capabilities-unreachable', "Couldn't reach:")}{' '}
                  {unavailablePlugins.map(pluginLabel).join(', ')}
                </p>
              )}

              {!filtered.length ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
                  <IconSearch className="size-7 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {tools.length
                      ? t(
                          'capabilities-no-match',
                          'No capabilities match this filter.',
                        )
                      : t('capabilities-empty', 'No tools are available yet.')}
                  </p>
                  {filtering && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setFilter('all');
                        setPage(0);
                      }}
                    >
                      {t('capabilities-clear', 'Clear filters')}
                    </Button>
                  )}
                </div>
              ) : !selectedPlugin ? (
                <>
                  <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                    <span>{t('capabilities-plugins-label', 'Plugins')}</span>
                    <span className="tabular-nums">
                      {t('capabilities-plugin-total', '{{count}} available', {
                        count: matchingPlugins.length,
                      })}
                    </span>
                  </div>
                  <div className="divide-y overflow-hidden rounded-xl border bg-background">
                    {visiblePlugins.map(([plugin, pluginTools]) => {
                      const writes = pluginTools.filter(
                        (tool) => tool.method === 'mutation',
                      ).length;
                      return (
                        <Button
                          key={plugin}
                          variant="ghost"
                          className="group h-auto w-full justify-start gap-4 rounded-none px-5 py-6 text-left sm:gap-5 sm:px-6"
                          onClick={() => {
                            setSelectedPlugin(plugin);
                            setPage(0);
                          }}
                        >
                          <PluginIcon plugin={plugin} />
                          <span className="min-w-0 flex-1 whitespace-normal">
                            <span className="block text-base font-semibold">
                              {pluginLabel(plugin)}
                            </span>
                            <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                              {pluginDescription(plugin)}
                            </span>
                            {filtering && (
                              <span className="mt-1 block text-xs font-normal text-primary">
                                {t(
                                  'capabilities-plugin-matches',
                                  '{{count}} matching tools',
                                  { count: matchCounts.get(plugin) ?? 0 },
                                )}
                              </span>
                            )}
                            <span className="mt-2.5 hidden items-center gap-3 text-[11px] font-normal text-muted-foreground/70 sm:flex">
                              <span>
                                {t(
                                  'capabilities-read-count',
                                  '{{count}} read',
                                  { count: pluginTools.length - writes },
                                )}
                              </span>
                              <span className="size-0.5 rounded-full bg-muted-foreground/40" />
                              <span>
                                {t(
                                  'capabilities-write-count',
                                  '{{count}} write',
                                  { count: writes },
                                )}
                              </span>
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-xl font-semibold tabular-nums tracking-tight">
                              {pluginTools.length}
                            </span>
                            <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                              {t('capabilities-tools', 'Tools')}
                            </span>
                          </span>
                          <IconArrowRight className="ml-1 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      );
                    })}
                  </div>
                  {matchingPlugins.length > 6 && !search.trim() && (
                    <Button
                      variant="ghost"
                      className="mt-3 w-full"
                      onClick={() => setShowAllPlugins((value) => !value)}
                    >
                      {showAllPlugins
                        ? t('capabilities-fewer-plugins', 'Show fewer plugins')
                        : t(
                            'capabilities-more-plugins',
                            'Show all {{count}} plugins',
                            { count: matchingPlugins.length },
                          )}
                      <IconChevronDown
                        className={cn('size-4', showAllPlugins && 'rotate-180')}
                      />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      {t('capabilities-results', '{{count}} tools', {
                        count: filtered.length,
                      })}
                    </span>
                    <span>
                      {t(
                        'capabilities-select-tool',
                        'Click a tool to see details',
                      )}
                    </span>
                  </div>
                  <div className="divide-y overflow-hidden rounded-xl border bg-background">
                    {pageTools.map((tool) => (
                      <ToolRow key={tool.id} tool={tool} />
                    ))}
                  </div>
                  {pageCount > 1 && (
                    <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {t('capabilities-page', 'Page {{page}} of {{total}}', {
                          page: currentPage + 1,
                          total: pageCount,
                        })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 0}
                          onClick={() => setPage(currentPage - 1)}
                        >
                          <IconChevronLeft className="size-4" />
                          {t('capabilities-previous', 'Previous')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage + 1 >= pageCount}
                          onClick={() => setPage(currentPage + 1)}
                        >
                          {t('capabilities-next', 'Next')}
                          <IconChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="mt-6 flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <IconLock className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  {t(
                    'capabilities-access-note',
                    'Your permissions apply to every tool. {{count}} tools ask for approval before making changes.',
                    { count: approvalCount },
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
