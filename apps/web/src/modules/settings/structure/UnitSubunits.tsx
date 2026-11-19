import type { UnitDetail, UnitNode } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconHierarchy, IconPlus, IconUsers } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, cn, Empty, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useWorkspace } from './context';
import { SortableList, SortableRow } from './Sortable';
import { TypeIcon } from './TypeIcon';
import { nodeOf, REORDER_MAX } from './unitTree';
import { useStructureHandlers } from './useStructureHandlers';

/** A subunit; a click selects it and brings it in sight. */
const SubunitButton = ({ unit }: { unit: UnitNode }) => {
  const { typesById, select } = useWorkspace();

  return (
    <Button
      variant="ghost"
      className="h-9 min-w-0 flex-1 justify-start"
      onClick={() => select(unit.id, unit)}
    >
      <TypeIcon type={unit.typeId ? typesById.get(unit.typeId) : undefined} size="sm" />
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-left font-normal',
          !unit.isActive && 'text-muted-foreground',
        )}
      >
        {unit.name}
      </span>
      <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground tabular-nums">
        <IconUsers className="size-3.5" aria-hidden />
        {unit.subtreeMemberCount}
      </span>
    </Button>
  );
};

const NoSubunits = ({ onAdd }: { onAdd?: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconHierarchy />
        </Empty.Media>
        <Empty.Title>{t('no-subunits', 'No subunits')}</Empty.Title>
        <Empty.Description>
          {t('no-subunits-hint', 'Units added under this one show here.')}
        </Empty.Description>
      </Empty.Header>
      {onAdd && (
        <Empty.Content>
          <Button variant="outline" onClick={onAdd}>
            <IconPlus />
            {t('add-subunit', 'Add subunit')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

/**
 * The units right under this one; a click selects and brings it in sight. While all of them fit
 * one call, members who manage the structure drag them into their order.
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
  const add = canManage && unit.isActive ? () => startDraft(nodeOf(unit)) : undefined;

  return (
    <section className="flex flex-col gap-2 p-3">
      <QueryState
        query={children}
        loading={<Skeleton className="h-9 w-full" />}
        isEmpty={(data) => !data.data.length}
        empty={<NoSubunits onAdd={add} />}
      >
        {(data) => (
          <>
            <div className="flex min-h-7 items-center gap-2 px-1 text-xs text-muted-foreground">
              <span className="min-w-0 flex-1 truncate">
                {t('units-under', '{{count}} units under it in all', {
                  count: unit.descendantCount,
                })}
              </span>
              {add && (
                <Button variant="ghost" size="sm" onClick={add}>
                  <IconPlus />
                  {t('add', 'Add')}
                </Button>
              )}
            </div>
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
              <p className="px-1 text-xs text-muted-foreground">
                {t('more-subunits', '{{count}} more in the tree and the chart.', {
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
