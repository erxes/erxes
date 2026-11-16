import type { SearchHit } from '@erxes/core-contract';
import { type PluginSearchHit, SearchType } from '@erxes/core-contract/values';
import { messageOf } from '@erxes/core-contract/client';
import {
  IconBuilding,
  IconHierarchy2,
  IconPackage,
  IconPuzzle,
  IconSearch,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { Button, Command, Spinner, usePageHotkey } from 'erxes-ui';
import { type ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import type { NavApp } from '~/modules/navigation/apps';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { useGlobalSearch } from './useGlobalSearch';

type Icon = ComponentType<{ className?: string }>;

/** How each core type is named and drawn, and where its records open. */
const CORE_TYPES: Record<SearchType, { label: string; icon: Icon; contentType?: string }> = {
  customer: { label: 'People', icon: IconUser, contentType: 'core:customer' },
  company: { label: 'Companies', icon: IconBuilding, contentType: 'core:company' },
  product: { label: 'Products', icon: IconPackage, contentType: 'core:product' },
  member: { label: 'Team members', icon: IconUserCircle, contentType: 'core:user' },
  unit: { label: 'Branches and departments', icon: IconHierarchy2 },
};

const HitItem = ({
  value,
  icon: ItemIcon,
  title,
  subtitle,
  onSelect,
}: {
  value: string;
  icon: Icon;
  title: string;
  subtitle?: string | null;
  onSelect: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });

  return (
    <Command.Item value={value} onSelect={onSelect}>
      <ItemIcon className="text-muted-foreground" />
      <span className="truncate">{title || t('untitled', 'Untitled')}</span>
      {subtitle && (
        <span className="ml-auto truncate text-xs text-muted-foreground">{subtitle}</span>
      )}
    </Command.Item>
  );
};

const GroupFailed = ({ error }: { error: Error }) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });

  return (
    <p className="px-2 py-1.5 text-xs text-destructive">
      {t('failed', 'Could not search here')}: {messageOf(error)}
    </p>
  );
};

interface SearchBodyProps {
  text: string;
  apps: NavApp[];
  appLabel: (app: NavApp) => string;
  onOpenApp: (app: NavApp) => void;
  onDone: () => void;
}

/** Core's matches, one group per type, each opening in the side panel. */
const CoreGroups = ({ hits, onDone }: { hits: SearchHit[]; onDone: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();

  const open = (hit: SearchHit) => {
    const { contentType } = CORE_TYPES[hit.type];

    if (contentType) openRecord({ contentType, contentId: hit.id });
    else void navigate(paths.settings.structure);

    onDone();
  };

  return SearchType.options.map((type) => {
    const group = hits.filter((hit) => hit.type === type);
    const meta = CORE_TYPES[type];

    return group.length ? (
      <Command.Group key={type} heading={t(`types.${type}`, meta.label)}>
        {group.map((hit) => (
          <HitItem
            key={hit.id}
            value={`${type}:${hit.id}`}
            icon={meta.icon}
            title={hit.title}
            subtitle={hit.subtitle}
            onSelect={() => open(hit)}
          />
        ))}
      </Command.Group>
    ) : null;
  });
};

/** One plugin source's matches, or why it failed; it opens a hit in the panel or at its path. */
const PluginGroup = ({
  source,
  onDone,
}: {
  source: ReturnType<typeof useGlobalSearch>['plugins'][number];
  onDone: () => void;
}) => {
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const { plugin, label, path, query } = source;

  const open = (hit: PluginSearchHit) => {
    if (hit.recordType) openRecord({ contentType: hit.recordType, contentId: hit.id });
    else if (hit.path) void navigate(hit.path);

    onDone();
  };

  if (!query.error && !query.data?.data.length) return null;

  return (
    <Command.Group heading={label}>
      {query.error && <GroupFailed error={query.error} />}
      {query.data?.data.map((hit) => (
        <HitItem
          key={hit.id}
          value={`${plugin}${path}:${hit.id}`}
          icon={IconPuzzle}
          title={hit.title}
          subtitle={hit.subtitle}
          onSelect={() => open(hit)}
        />
      ))}
    </Command.Group>
  );
};

/** The results: apps by name, then core's groups, then each plugin's. */
const SearchResults = ({ text, apps, appLabel, onOpenApp, onDone }: SearchBodyProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });
  const { q, typing, core, plugins } = useGlobalSearch(text);
  const needle = text.trim().toLowerCase();
  const matchingApps = apps.filter((app) => appLabel(app).toLowerCase().includes(needle));
  const hits = core.data?.data ?? [];
  const loading = typing || core.isFetching || plugins.some(({ query }) => query.isFetching);

  const found =
    hits.length + plugins.reduce((sum, { query }) => sum + (query.data?.data.length ?? 0), 0);

  return (
    <Command.List>
      {matchingApps.length > 0 && (
        <Command.Group heading={t('apps', 'Apps')}>
          {matchingApps.map((app) => (
            <HitItem
              key={app.id}
              value={`app:${app.id}`}
              icon={app.icon}
              title={appLabel(app)}
              onSelect={() => {
                onOpenApp(app);
                onDone();
              }}
            />
          ))}
        </Command.Group>
      )}
      {core.error && <GroupFailed error={core.error} />}
      <CoreGroups hits={hits} onDone={onDone} />
      {plugins.map((source) => (
        <PluginGroup key={`${source.plugin}${source.path}`} source={source} onDone={onDone} />
      ))}
      {loading && <Spinner size="sm" className="my-3" />}
      {!loading && q && found === 0 && matchingApps.length === 0 && (
        <Command.Empty>{t('none', 'Nothing matches “{{q}}”', { q })}</Command.Empty>
      )}
      {!q && !matchingApps.length && (
        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
          {t('hint', 'Type at least 2 characters')}
        </p>
      )}
    </Command.List>
  );
};

/**
 * The top bar's search: people, companies, products, team members, units and
 * every plugin's records in one box. Opens with its button or Ctrl/⌘ K.
 */
export const GlobalSearch = ({
  apps,
  appLabel,
  onOpenApp,
}: Omit<SearchBodyProps, 'text' | 'onDone'>) => {
  const { t } = useTranslation('common', { keyPrefix: 'search' });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const label = t('title', 'Search');

  usePageHotkey('mod+k', () => setOpen(true));

  const close = () => {
    setOpen(false);
    setText('');
  };

  return (
    <>
      <CoreTabTooltip label={`${label} (Ctrl/⌘ K)`}>
        <Button
          type="button"
          size="icon"
          variant="nav"
          aria-label={label}
          aria-keyshortcuts="Control+K Meta+K"
          className="relative shrink-0"
          onClick={() => setOpen(true)}
        >
          <IconSearch className="size-4" />
        </Button>
      </CoreTabTooltip>
      <Command.Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        title={label}
        description={t('description', 'Search records and apps')}
        shouldFilter={false}
        className="max-w-2xl"
      >
        <Command.Input
          value={text}
          onValueChange={setText}
          placeholder={t('placeholder', 'Search people, companies, products and more')}
        />
        <SearchResults
          text={text}
          apps={apps}
          appLabel={appLabel}
          onOpenApp={onOpenApp}
          onDone={close}
        />
      </Command.Dialog>
    </>
  );
};
