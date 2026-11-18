import type { UnitDetail, UnitNode } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconHierarchy, IconPlus, IconUsers } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, cn, Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useWorkspace } from './context';
import { SortableList, SortableRow } from './Sortable';
import { TypeIcon } from './TypeIcon';
import { nodeOf, REORDER_MAX } from './unitTree';
import { useStructureHandlers } from './useStructureHandlers';

export const SectionHeading = ({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children?: ReactNode;
}) => (
  <div className="flex min-h-7 items-center gap-2">
    <h3 className="text-sm font-semibold">{title}</h3>
    <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
    {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
  </div>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border px-2.5 py-2">
    <p className="text-lg leading-tight font-semibold tabular-nums">{value}</p>
    <p className="truncate text-xs text-muted-foreground">{label}</p>
  </div>
);

/** Members here directly, with every unit under it, and how many units sit under it. */
export const UnitStats = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label={t('direct', 'Direct')} value={unit.memberIds.length} />
      <Stat label={t('with-subunits', 'With subunits')} value={unit.subtreeMemberCount} />
      <Stat label={t('subunits', 'Subunits')} value={unit.descendantCount} />
    </div>
  );
};

/** A subunit; a click selects it and brings it in sight. */
const SubunitButton = ({ unit }: { unit: UnitNode }) => {
  const { typesById, select } = useWorkspace();

  return (
    <button
      type="button"
      className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-1 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring/70"
      onClick={() => select(unit.id, unit)}
    >
      <TypeIcon type={unit.typeId ? typesById.get(unit.typeId) : undefined} size="sm" />
      <span className={cn('min-w-0 flex-1 truncate', !unit.isActive && 'text-muted-foreground')}>
        {unit.name}
      </span>
      <span className="flex w-10 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums">
        <IconUsers className="size-3.5" aria-hidden />
        {unit.subtreeMemberCount}
      </span>
    </button>
  );
};

/**
 * The units right under this one; a click selects and pans to it. While all of them fit one
 * call, members who manage the structure drag them into their order.
 */
export const Subunits = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { includeInactive, startDraft, canManage } = useWorkspace();
  const [order, setOrder] = useState<string[] | null>(null);

  const children = useQuery(
    orpc.units.children.queryOptions({
      input: { id: unit.id, limit: REORDER_MAX, includeInactive },
    }),
  );

  const reorder = useMutation(
    orpc.units.reorder.mutationOptions({
      ...useStructureHandlers(),
      onSettled: () => setOrder(null),
    }),
  );

  const loaded = children.data?.data ?? [];
  const byId = new Map(loaded.map((child) => [child.id, child]));
  const ids = order ?? loaded.map((child) => child.id);
  const sortable = canManage && !children.data?.nextCursor && loaded.length > 1;

  return (
    <section className="flex flex-col gap-1.5">
      <SectionHeading title={t('subunits', 'Subunits')} count={unit.childCount}>
        {canManage && unit.isActive && (
          <Button variant="ghost" size="sm" onClick={() => startDraft(nodeOf(unit))}>
            <IconPlus />
            {t('add', 'Add')}
          </Button>
        )}
      </SectionHeading>
      <QueryState
        query={children}
        loading={<Skeleton className="h-9 w-full" />}
        isEmpty={(data) => !data.data.length}
        empty={
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconHierarchy className="size-4" aria-hidden />
            {t('no-subunits', 'No subunits.')}
          </p>
        }
      >
        {(data) => (
          <>
            <SortableList
              ids={ids}
              nameOf={(id) => byId.get(id)?.name ?? id}
              onOrder={(next) => {
                setOrder(next);
                reorder.mutate({ id: unit.id, unitIds: next });
              }}
              className="flex flex-col"
            >
              {ids.map((id) => {
                const child = byId.get(id);

                return child ? (
                  <SortableRow key={id} id={id} name={child.name} sortable={sortable}>
                    <SubunitButton unit={child} />
                  </SortableRow>
                ) : null;
              })}
            </SortableList>
            {data.nextCursor && (
              <p className="text-xs text-muted-foreground">
                {t('more-subunits', '{{count}} more in the chart and the list.', {
                  count: data.totalCount - data.data.length,
                })}
              </p>
            )}
          </>
        )}
      </QueryState>
    </section>
  );
};
