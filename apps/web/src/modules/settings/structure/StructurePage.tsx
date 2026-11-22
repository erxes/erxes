import type { Unit } from '@erxes/core-contract';
import { UnitKind } from '@erxes/core-contract/values';
import { IconHierarchy2, IconPlus } from '@tabler/icons-react';
import {
  Button,
  PageContainer,
  PageHeader,
  PageSubHeader,
  ScrollArea,
  ToggleGroup,
  AppBreadcrumb,
} from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { EmptyKind, NoMatch, TreeSkeleton, TreeTools } from './StructureTools';
import { UnitSheet } from './UnitSheet';
import { UnitTree } from './UnitTree';
import { UnitTypes } from './UnitTypes';
import { childCounts, useUnits, useUnitTypes, visibleRows } from './useUnits';

/** Branches or departments, from `?kind=`; branches when it names neither. */
const useKindParam = (): [UnitKind, (kind: UnitKind) => void] => {
  const [value, setValue] = useQueryState('kind');
  const parsed = UnitKind.safeParse(value);

  return [
    parsed.success ? parsed.data : 'branch',
    (kind) => void setValue(kind === 'branch' ? null : kind),
  ];
};

/** How the page words branches or departments. */
const useWords = (kind: UnitKind) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return kind === 'branch'
    ? {
        add: t('add-branch', 'Add branch'),
        empty: t('no-branches-title', 'No branches yet'),
        emptyHint: t(
          'no-branches',
          'Branches are where your team works: a head office, stores, warehouses.',
        ),
        search: t('search-branches', 'Search branches'),
      }
    : {
        add: t('add-department', 'Add department'),
        empty: t('no-departments-title', 'No departments yet'),
        emptyHint: t(
          'no-departments',
          'Departments are what your team does: sales, finance, support.',
        ),
        search: t('search-departments', 'Search departments'),
      };
};

/** Which sheet is open: a unit to edit, or a new one under `parentId`. A new key remounts it. */
type SheetTarget = { unit: Unit | null; parentId: string | null; key: number };

const KindPanel = ({
  kind,
  canChange,
  onOpen,
}: {
  kind: UnitKind;
  canChange: boolean;
  onOpen: (unit: Unit | null, parentId: string | null) => void;
}) => {
  const words = useWords(kind);
  const query = useUnits(kind);
  const typeQuery = useUnitTypes(kind);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const units = query.data?.data ?? [];
  const types = typeQuery.data?.data ?? [];
  const parents = [...childCounts(units).keys()];
  const rows = visibleRows(units, collapsed, search);

  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);

      if (!next.delete(id)) next.add(id);

      return next;
    });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QueryState query={typeQuery}>
          {() => <UnitTypes kind={kind} types={types} canChange={canChange} />}
        </QueryState>
        {units.length > 0 && (
          <TreeTools
            search={search}
            onSearch={setSearch}
            placeholder={words.search}
            folded={collapsed.size > 0}
            onFold={parents.length ? (fold) => setCollapsed(new Set(fold ? parents : [])) : null}
          />
        )}
      </div>
      <QueryState
        query={query}
        loading={<TreeSkeleton />}
        isEmpty={(data) => !data.data.length}
        empty={
          <EmptyKind
            kind={kind}
            title={words.empty}
            hint={words.emptyHint}
            add={canChange ? words.add : null}
            onAdd={() => onOpen(null, null)}
          />
        }
      >
        {() =>
          rows.length ? (
            <UnitTree
              kind={kind}
              rows={rows}
              units={units}
              types={types}
              collapsed={collapsed}
              searching={Boolean(search.trim())}
              canChange={canChange}
              onToggle={toggle}
              onEdit={(unit) => onOpen(unit, unit.parentId)}
              onAddUnder={(unit) => onOpen(null, unit.id)}
            />
          ) : (
            <NoMatch search={search} />
          )
        }
      </QueryState>
    </div>
  );
};

/** Branches or departments, each with how many there are. */
const KindSwitch = ({ kind, onChange }: { kind: UnitKind; onChange: (kind: UnitKind) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  const counts = {
    branch: useUnits('branch').data?.data.length,
    department: useUnits('department').data?.data.length,
  };

  const labels = { branch: t('branches', 'Branches'), department: t('departments', 'Departments') };

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      value={[kind]}
      onValueChange={([next]) => {
        const picked = UnitKind.safeParse(next);

        if (picked.success) onChange(picked.data);
      }}
    >
      {UnitKind.options.map((one) => (
        <ToggleGroup.Item key={one} value={one}>
          {labels[one]}
          {counts[one] !== undefined && (
            <span className="text-muted-foreground tabular-nums">{counts[one]}</span>
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

/**
 * Settings › Structure: the organisation's branches (where people work) and departments (what
 * they do), shared by every plugin.
 */
export const StructurePage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const canChange = useCan()('structure.manage');
  const [kind, setKind] = useKindParam();
  const words = useWords(kind);

  const units = useUnits(kind);
  const types = useUnitTypes(kind);
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [open, setOpen] = useState(false);

  const openSheet = (unit: Unit | null, parentId: string | null) => {
    setSheet((current) => ({ unit, parentId, key: (current?.key ?? 0) + 1 }));
    setOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Structure'),
                to: paths.settings.structure,
                icon: IconHierarchy2,
              },
            ]}
          />
        </PageHeader.Start>
        {canChange && (
          <PageHeader.End>
            <Button onClick={() => openSheet(null, null)}>
              <IconPlus />
              {words.add}
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>
      <PageSubHeader className="items-center">
        <KindSwitch kind={kind} onChange={setKind} />
        <span className="hidden text-sm text-muted-foreground md:block">
          {t(
            'page-hint',
            'Shared by every plugin. Supervisors see the records of the units they lead.',
          )}
        </span>
      </PageSubHeader>
      <ScrollArea className="flex-1">
        <KindPanel key={kind} kind={kind} canChange={canChange} onOpen={openSheet} />
      </ScrollArea>
      {sheet && (
        <UnitSheet
          key={sheet.key}
          kind={kind}
          unit={sheet.unit}
          parentId={sheet.parentId}
          units={units.data?.data ?? []}
          types={types.data?.data ?? []}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </PageContainer>
  );
};
