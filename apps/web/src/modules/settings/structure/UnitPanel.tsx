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
import {
  Badge,
  Button,
  DropdownMenu,
  ScrollArea,
  Skeleton,
  Tabs,
  TextField,
  useConfirm,
  usePageHotkey,
} from 'erxes-ui';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useWorkspace } from './context';
import { TypeIcon } from './TypeIcon';
import { nodeOf } from './unitTree';
import { UnitFields, useSaveUnit } from './UnitFields';
import { MoveBar } from './UnitMove';
import { UnitPeople } from './UnitPeople';
import { Subunits } from './UnitSubunits';
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
            'Subunits: {{children}}. Members: {{members}}. API keys that name it: {{keys}}. Turn it off instead: it leaves the chart, and records keep it.',
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

/** Where the unit sits, then its icon, its name (renamed in place) and its type. */
const Heading = ({ unit, onMove }: { unit: UnitDetail; onMove: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select, canManage, typesById } = useWorkspace();
  const save = useSaveUnit();
  const type = unit.typeId ? typesById.get(unit.typeId) : undefined;

  return (
    <div className="flex flex-none flex-col gap-1 px-3 pt-2 pb-3">
      <div className="flex min-h-7 items-center gap-1">
        <PathCrumbs unit={unit} />
        {canManage && <UnitMenu unit={unit} onMove={onMove} />}
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
        <div className="min-w-0 flex-1">
          <TextField
            variant="title"
            scope={`structure-unit.${unit.id}.name`}
            value={unit.name}
            placeholder={t('unit-name', 'Unit name')}
            disabled={!canManage}
            onSave={(next) => {
              const name = next.trim();

              if (name && name !== unit.name) save.mutate({ id: unit.id, name });
            }}
          />
        </div>
        {type && <Badge variant="secondary">{type.name}</Badge>}
        {!unit.isActive && <Badge variant="warning">{t('inactive', 'Inactive')}</Badge>}
      </div>
    </div>
  );
};

export type UnitTab = 'details' | 'people' | 'subunits';

const isUnitTab = (value: unknown): value is UnitTab =>
  value === 'details' || value === 'people' || value === 'subunits';

const Body = ({
  unit,
  tab,
  onTab,
}: {
  unit: UnitDetail;
  tab: UnitTab;
  onTab: (tab: UnitTab) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [moving, setMoving] = useState(false);

  return (
    <>
      <Heading unit={unit} onMove={() => setMoving(true)} />
      {moving && (
        <div className="flex-none px-3 pb-3">
          <MoveBar unit={unit} onDone={() => setMoving(false)} />
        </div>
      )}
      <Tabs
        value={tab}
        onValueChange={(next) => {
          if (isUnitTab(next)) onTab(next);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-none border-b px-3">
          <Tabs.List variant="flush" className="h-9">
            <Tabs.Trigger value="details">{t('details', 'Details')}</Tabs.Trigger>
            <Tabs.Trigger value="people">
              {t('people', 'People')}
              <Badge variant="muted" size="sm">
                {unit.memberIds.length}
              </Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="subunits">
              {t('subunits', 'Subunits')}
              <Badge variant="muted" size="sm">
                {unit.childCount}
              </Badge>
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <Tabs.Content value="details">
            <UnitFields unit={unit} />
          </Tabs.Content>
          <Tabs.Content value="people">
            <UnitPeople unit={unit} />
          </Tabs.Content>
          <Tabs.Content value="subunits">
            <Subunits unit={unit} />
          </Tabs.Content>
        </ScrollArea>
      </Tabs>
    </>
  );
};

/** The selected unit beside the tree or the chart; its tab stays as the selection moves. */
export const UnitPanel = ({ unitId }: { unitId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select } = useWorkspace();
  const [tab, setTab] = useState<UnitTab>('details');
  const unit = useQuery(orpc.units.get.queryOptions({ input: { id: unitId } }));

  usePageHotkey('Escape', () => select(null));

  return (
    <aside
      aria-label={t('unit-details', 'Unit details')}
      className="flex size-full flex-col overflow-hidden bg-background"
    >
      <QueryState
        query={unit}
        loading={
          <div className="flex flex-col gap-3 p-4" aria-busy="true">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        {(data) => <Body key={data.id} unit={data} tab={tab} onTab={setTab} />}
      </QueryState>
    </aside>
  );
};
