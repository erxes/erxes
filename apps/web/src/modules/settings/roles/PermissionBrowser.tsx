import type { PermissionInfo } from '@erxes/core-contract';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, InputGroup, ToggleGroup } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NoMatches } from '~/components/NoMatches';
import { orpc } from '@erxes/core-contract/client';
import { SectionCard, type Toggle } from './PermissionSectionCard';
import {
  filterSections,
  type GrantFilter,
  type PermissionSection,
  sectionsOf,
} from './permissionSections';

const GRANT_FILTERS: GrantFilter[] = ['all', 'granted', 'not-granted'];

/** Plugin titles by name, from the registry; a plugin it does not list shows its key. */
const usePluginTitles = () => {
  const plugins = useQuery(
    orpc.plugins.list.queryOptions({
      staleTime: 60_000,
      select: ({ data }) =>
        new Map(data.flatMap(({ name, manifest }) => (manifest ? [[name, manifest.title]] : []))),
    }),
  );

  return plugins.data;
};

const Toolbar = ({
  query,
  filter,
  allOpen,
  onQuery,
  onFilter,
  onToggleAll,
}: {
  query: string;
  filter: GrantFilter;
  allOpen: boolean;
  onQuery: (query: string) => void;
  onFilter: (filter: GrantFilter) => void;
  onToggleAll: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  const labels: Record<GrantFilter, string> = {
    all: t('filter-all', 'All'),
    granted: t('filter-granted', 'Granted'),
    'not-granted': t('filter-not-granted', 'Not granted'),
  };

  return (
    <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-2 bg-background px-1 py-2">
      <InputGroup className="h-8 min-w-48 flex-1">
        <InputGroup.Addon>
          <IconSearch className="pointer-events-none size-3.5" />
        </InputGroup.Addon>
        <InputGroup.Input
          type="search"
          placeholder={t('search', 'Search permissions or plugins…')}
          aria-label={t('search', 'Search permissions or plugins…')}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </InputGroup>
      <ToggleGroup
        variant="outline"
        size="sm"
        aria-label={t('filter', 'Show')}
        value={[filter]}
        onValueChange={([next]) => onFilter(GRANT_FILTERS.find((item) => item === next) ?? 'all')}
      >
        {GRANT_FILTERS.map((item) => (
          <ToggleGroup.Item key={item} value={item}>
            {labels[item]}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
      <Button variant="ghost" size="sm" tone="muted" onClick={onToggleAll}>
        {allOpen ? t('collapse-all', 'Collapse all') : t('expand-all', 'Expand all')}
      </Button>
    </div>
  );
};

/** Sections that start open: core, and every source when there are only a few. */
const initialOpen = (sections: PermissionSection[]) =>
  new Set(
    sections
      .filter((section) => sections.length <= 3 || section.source === 'core')
      .map((section) => section.source),
  );

/**
 * Every permission a role can have, by source (core, then each plugin) and area: each source
 * folds shut, with a select-all box, a granted count and its plugin's ready-made sets. A search
 * or a filter opens every source.
 */
export const PermissionBrowser = ({
  catalog,
  granted,
  editable,
  blocked,
  onChange,
}: {
  catalog: PermissionInfo[];
  granted: Set<string>;
  editable: boolean;
  /** The actions the role's reach keeps it from holding (`outsideReach`). */
  blocked: Set<string>;
  onChange: Toggle;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const titles = usePluginTitles();
  const sets = useQuery(orpc.roles.permissionSets.queryOptions({ staleTime: 60_000 }));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GrantFilter>('all');

  const sections = useMemo(
    () =>
      sectionsOf(catalog, sets.data?.data ?? [], (source) =>
        source === 'core' ? t('core', 'Core') : (titles?.get(source) ?? source),
      ),
    [catalog, sets.data, titles, t],
  );

  const [open, setOpen] = useState(() => initialOpen(sections));
  const shown = filterSections(sections, query, filter, granted);
  const allOpen = shown.every((section) => open.has(section.source));
  const openEvery = () => setOpen(new Set(sections.map((section) => section.source)));

  const toggleOne = (source: string, next: boolean) => {
    const changed = new Set(open);

    if (next) changed.add(source);
    else changed.delete(source);

    setOpen(changed);
  };

  return (
    <div className="space-y-2">
      <Toolbar
        query={query}
        filter={filter}
        allOpen={allOpen}
        onQuery={(next) => {
          setQuery(next);
          openEvery();
        }}
        onFilter={(next) => {
          setFilter(next);
          openEvery();
        }}
        onToggleAll={() => (allOpen ? setOpen(new Set()) : openEvery())}
      />
      {shown.length === 0 ? (
        <NoMatches
          title={t('no-match', 'No permissions match')}
          description={t('no-match-description', 'Try another word or show all.')}
        />
      ) : (
        shown.map((section) => (
          <SectionCard
            key={section.source}
            section={section}
            open={open.has(section.source)}
            granted={granted}
            editable={editable}
            blocked={blocked}
            onOpenChange={(next) => toggleOne(section.source, next)}
            onChange={onChange}
          />
        ))
      )}
    </div>
  );
};
