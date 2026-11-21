import { IconBuilding, IconGitBranch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from 'erxes-ui/components/badge';
import { Skeleton } from 'erxes-ui/components/skeleton';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import { Tooltip } from 'erxes-ui/components/tooltip';
import type { UnitChoice, UnitQueries } from 'erxes-ui/modules/records/units';
import { treeRows } from 'erxes-ui/modules/tree/treeRows';
import { pickerFamily } from './selectFamilyParts';

type UnitKind = 'branch' | 'department';

interface UnitSource {
  /** `unitQueries` from `@erxes/core-contract/client`. */
  units: UnitQueries;
}

/**
 * Core's branches or departments: parents first, siblings by code.
 * Each has its `order` path and whether units sit under it; 3.x's `useBranchesMain` and
 * `useDepartmentsMain`.
 */
export const useUnits = (units: UnitQueries, kind: UnitKind) => {
  const query = useQuery(units.list(kind));
  const list = query.data?.data;

  const rows = useMemo(
    () => treeRows(list ?? [], (unit) => `${unit.code ?? ''} ${unit.name}`),
    [list],
  );

  return { units: rows, loading: query.isPending, error: query.error };
};

/** A unit's code, muted, then its name, as 3.x drew one. */
const UnitLabel = ({ item }: { item: UnitChoice }) => (
  <span className="flex min-w-0 flex-auto items-center gap-2">
    {item.code && <span className="shrink-0 text-muted-foreground">{item.code}</span>}
    <TextOverflowTooltip value={item.name} className="w-auto flex-auto font-medium" />
  </span>
);

const unitFamily = (kind: UnitKind, icon: typeof IconGitBranch) =>
  pickerFamily<UnitSource, ReturnType<typeof useUnits>['units'][number]>({
    name: `select-${kind}`,
    icon,
    useById: ({ units }) => {
      const { units: rows, loading } = useUnits(units, kind);

      return { byId: new Map(rows.map((unit) => [unit.id, unit])), loading };
    },
    useList: ({ units }) => {
      const { units: rows, loading, error } = useUnits(units, kind);

      return { items: rows, loading, error };
    },
    itemKey: (unit) => ({ id: unit.id, label: `${unit.code ?? ''} ${unit.name}` }),
    Item: UnitLabel,
    treeOf: (unit) => unit,
    useTexts: () => {
      const { t } = useTranslation('ui', { keyPrefix: kind });

      return kind === 'branch'
        ? {
            search: t('search', 'Search branches'),
            placeholder: t('select', 'Select branches'),
            count: (count) => t('selected', '{{count}} branches selected', { count }),
          }
        : {
            search: t('search', 'Search departments'),
            placeholder: t('select', 'Select departments'),
            count: (count) => t('selected', '{{count}} departments selected', { count }),
          };
    },
  });

/**
 * Picks core's branches in a table cell, a form field or a filter.
 * 3.x's `SelectBranches`, as a tree. Each takes `units` (`unitQueries` from `@erxes/core-contract/client`), `value` and
 * `onValueChange`; `mode="multiple"` picks several.
 */
export const SelectBranches = unitFamily('branch', IconGitBranch);

/**
 * Picks core's departments in a table cell, a form field or a filter.
 * 3.x's `SelectDepartments`, as a tree. Each takes `units` (`unitQueries` from `@erxes/core-contract/client`), `value` and
 * `onValueChange`; `mode="multiple"` picks several.
 */
export const SelectDepartments = unitFamily('department', IconBuilding);

type BadgeOwnProps = Omit<ComponentProps<typeof Badge>, 'children'> & UnitSource;

type UnitBadgeProps = BadgeOwnProps & {
  kind: UnitKind;
  /** The unit, when the page has it; else it is read by `unitId`. */
  unit?: UnitChoice;
  unitId?: string | null;
};

const UnitBadge = ({ kind, unit, unitId, units, ...props }: UnitBadgeProps) => {
  const { units: rows, loading } = useUnits(units, kind);
  const shown = unit ?? rows.find((row) => row.id === unitId);

  if (!shown && loading && unitId) return <Skeleton className="h-4 w-8" />;

  if (!shown) return null;

  return (
    <Badge variant="secondary" {...props}>
      {shown.code && <span className="shrink-0 text-muted-foreground">{shown.code}</span>}
      <TextOverflowTooltip value={shown.name} />
    </Badge>
  );
};

/**
 * A branch as a badge: its code and name.
 * It reads the branch by `branchId` unless `branch` is given.
 */
export const BranchBadge = ({
  branch,
  branchId,
  ...props
}: BadgeOwnProps & { branch?: UnitChoice; branchId?: string | null }) => (
  <UnitBadge kind="branch" unit={branch} unitId={branchId} {...props} />
);

/**
 * A department as a badge: its code and name.
 * It reads the department by `departmentId` unless `department` is given.
 */
export const DepartmentBadge = ({
  department,
  departmentId,
  ...props
}: BadgeOwnProps & { department?: UnitChoice; departmentId?: string | null }) => (
  <UnitBadge kind="department" unit={department} unitId={departmentId} {...props} />
);

type UnitsInlineProps = UnitSource & { placeholder?: string };

const UnitsInline = ({
  kind,
  unitIds = [],
  units,
  placeholder,
}: UnitsInlineProps & { kind: UnitKind; unitIds?: string[] }) => {
  const { t } = useTranslation('ui', { keyPrefix: kind });
  const { units: rows, loading } = useUnits(units, kind);

  if (loading && unitIds.length) return <Skeleton className="h-4 w-16" />;

  const labels = unitIds.map((id) => rows.find((row) => row.id === id)?.name ?? id);

  if (!labels.length) return <span className="text-accent-foreground/70">{placeholder}</span>;

  if (labels.length < 3) return <TextOverflowTooltip value={labels.join(', ')} />;

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger render={<span />}>
          {kind === 'branch'
            ? t('count', '{{count}} branches', { count: labels.length })
            : t('count', '{{count}} departments', { count: labels.length })}
        </Tooltip.Trigger>
        <Tooltip.Content>{labels.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

/**
 * Branches by id as their names, joined.
 * Past two, a count, with the names on hover.
 */
export const BranchesInline = ({
  branchIds,
  ...props
}: UnitsInlineProps & { branchIds?: string[] }) => (
  <UnitsInline kind="branch" unitIds={branchIds} {...props} />
);

/**
 * Departments by id as their names, joined.
 * Past two, a count, with the names on hover.
 */
export const DepartmentsInline = ({
  departmentIds,
  ...props
}: UnitsInlineProps & { departmentIds?: string[] }) => (
  <UnitsInline kind="department" unitIds={departmentIds} {...props} />
);
