import type { UnitDetail } from '@erxes/core-contract';
import { isApiError, orpc } from '@erxes/core-contract/client';
import {
  IconArrowsMove,
  IconChevronRight,
  IconDots,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, DropdownMenu, Skeleton, useConfirm, usePageHotkey } from 'erxes-ui';
import { Fragment, type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';
import { nodeOf } from './unitTree';
import { UnitFields, useSaveUnit } from './UnitFields';
import { MoveBar } from './UnitMove';
import { UnitPeople } from './UnitPeople';
import { Subunits, UnitStats } from './UnitSubunits';
import { useStructureHandlers } from './useStructureHandlers';

/** The units above this one; a click selects and brings it in sight. */
const PathCrumbs = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select } = useWorkspace();

  const above = useQuery(
    orpc.units.ancestors.queryOptions({ input: { id: unit.id, includeInactive: true } }),
  );

  return (
    <nav
      aria-label={t('path', 'Path')}
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden text-xs text-muted-foreground"
    >
      {(above.data?.data ?? []).map((item, i) => (
        <Fragment key={item.id}>
          {i > 0 && <IconChevronRight className="size-3 shrink-0" aria-hidden />}
          <Button
            variant="ghost"
            size="xs"
            tone="muted"
            className="min-w-0 shrink"
            onClick={() => select(item.id, item)}
          >
            <span className="truncate font-normal">{item.name}</span>
          </Button>
        </Fragment>
      ))}
    </nav>
  );
};

/** The unit's name, renamed in place: Enter or leaving saves, Escape puts it back. */
const Title = ({ unit, editable }: { unit: UnitDetail; editable: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const save = useSaveUnit();
  const [value, setValue] = useState(unit.name);

  if (!editable)
    return <h2 className="min-w-0 flex-1 truncate px-1.5 text-lg font-semibold">{unit.name}</h2>;

  const commit = () => {
    const name = value.trim();

    if (name && name !== unit.name) save.mutate({ id: unit.id, name });
    else setValue(unit.name);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur();

    if (event.key === 'Escape') {
      event.stopPropagation();
      setValue(unit.name);
      event.currentTarget.blur();
    }
  };

  return (
    <input
      value={value}
      aria-label={t('unit-name', 'Unit name')}
      maxLength={200}
      className="h-9 min-w-0 flex-1 rounded-md bg-transparent px-1.5 text-lg font-semibold outline-none hover:bg-accent focus:bg-background focus-visible:ring-2 focus-visible:ring-ring"
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
};

/** Deletes a unit nothing is in; one that turns out to hold something can be turned off. */
const useRemoveUnit = (unit: UnitDetail) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const { select } = useWorkspace();
  const save = useSaveUnit();
  const handlers = useStructureHandlers(() => select(unit.parentId));
  const remove = useMutation(orpc.units.remove.mutationOptions());

  const run = async () => {
    await confirm({
      message: t('delete-confirm', 'Delete {{name}}?', { name: unit.name }),
      options: { okLabel: t('delete', 'Delete') },
    });

    try {
      handlers.onSuccess(await remove.mutateAsync({ id: unit.id }));
    } catch (error) {
      if (!isApiError(error, 'UNIT_NOT_EMPTY')) {
        handlers.onError(error);

        return;
      }

      await confirm({
        message: t('not-empty', '{{name}} still holds something', { name: unit.name }),
        options: {
          description: t(
            'not-empty-hint',
            'Subunits: {{children}}. Members: {{members}}. Customers and companies: {{records}}. API keys that name it: {{keys}}. Turn it off instead: it leaves the chart, and records keep it.',
            error.data,
          ),
          okLabel: t('turn-off', 'Turn it off'),
        },
      });
      save.mutate({ id: unit.id, isActive: false });
    }
  };

  return { run, pending: remove.isPending };
};

/** Add a subunit, move the unit, or delete it; the organisation's own unit only takes subunits. */
const UnitMenu = ({ unit, onMove }: { unit: UnitDetail; onMove: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { startDraft } = useWorkspace();
  const remove = useRemoveUnit(unit);
  const isRoot = !unit.parentId;
  const holds = unit.descendantCount > 0 || unit.memberIds.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button variant="ghost" size="icon" aria-label={t('unit-actions', 'Unit actions')} />
        }
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="max-w-72">
        {unit.isActive && (
          <DropdownMenu.Item onClick={() => startDraft(nodeOf(unit))}>
            <IconPlus />
            {t('add-subunit', 'Add subunit')}
          </DropdownMenu.Item>
        )}
        {!isRoot && (
          <>
            <DropdownMenu.Item onClick={onMove}>
              <IconArrowsMove />
              {t('move', 'Move')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              variant="destructive"
              disabled={holds || remove.pending}
              onClick={() => void remove.run()}
            >
              <IconTrash />
              <span className="flex min-w-0 flex-col">
                {t('delete', 'Delete')}
                {holds && (
                  <span className="text-xs text-muted-foreground">
                    {t(
                      'delete-blocked',
                      'It has subunits or members. Move them first, or turn it off instead.',
                    )}
                  </span>
                )}
              </span>
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const Body = ({ unit }: { unit: UnitDetail }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select, canManage, typeOf } = useWorkspace();
  const [moving, setMoving] = useState(false);
  const type = typeOf(unit.typeId);

  return (
    <>
      <div className="flex flex-col gap-1 border-b px-3 pt-2 pb-3">
        <div className="flex min-h-7 items-center gap-1">
          <PathCrumbs unit={unit} />
          {canManage && <UnitMenu unit={unit} onMove={() => setMoving(true)} />}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('close', 'Close')}
            onClick={() => select(null)}
          >
            <IconX />
          </Button>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <TypeIcon type={type} size="lg" />
          <Title key={unit.name} unit={unit} editable={canManage} />
          {type && (
            <Badge variant="secondary" className="shrink-0">
              {type.name}
            </Badge>
          )}
          {!unit.isActive && <Badge variant="warning">{t('inactive', 'Inactive')}</Badge>}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
        {moving && <MoveBar unit={unit} onDone={() => setMoving(false)} />}
        <UnitStats unit={unit} />
        <div className="-mx-4">
          <UnitFields unit={unit} />
        </div>
        <Subunits unit={unit} />
        <UnitPeople unit={unit} />
      </div>
    </>
  );
};

/** The selected unit beside the chart or the list, which stay usable behind it. */
export const UnitPanel = ({ unitId }: { unitId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select } = useWorkspace();
  const unit = useQuery(orpc.units.get.queryOptions({ input: { id: unitId } }));

  usePageHotkey('Escape', () => select(null));

  return (
    <aside
      aria-label={t('unit-details', 'Unit details')}
      className="absolute inset-y-2 right-2 left-2 z-20 flex flex-col overflow-hidden rounded-md border bg-background shadow-lg sm:left-auto sm:w-md"
    >
      <QueryState
        query={unit}
        loading={
          <div className="flex flex-col gap-3 p-4" aria-busy="true">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        {(data) => <Body key={data.id} unit={data} />}
      </QueryState>
    </aside>
  );
};
