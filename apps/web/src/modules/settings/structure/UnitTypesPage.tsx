import type { UnitType } from '@erxes/core-contract';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import {
  IconCategory,
  IconHierarchy2,
  IconLock,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  PageContainer,
  PageHeader,
  ScrollArea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { withOrders } from '~/modules/properties/reorder';
import { SortableList, SortableRow } from './Sortable';
import { TypeIcon } from './TypeIcon';
import { UnitTypeForm } from './UnitTypeForm';
import { useStructureHandlers } from './useStructureHandlers';

/** Right under the organisation, the types it may sit under, or any unit. */
const Placement = ({ type, types }: { type: UnitType; types: UnitType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const parents = types.filter((other) => type.allowedParentTypeIds.includes(other.id));

  return (
    <span className="flex flex-wrap items-center gap-1">
      {type.canBeRoot && <Badge variant="info">{t('top-level', 'Top level')}</Badge>}
      {parents.length ? (
        parents.map((parent) => (
          <Badge key={parent.id} variant="secondary">
            {parent.name}
          </Badge>
        ))
      ) : (
        <span className="text-xs text-muted-foreground">{t('under-any', 'Under any unit')}</span>
      )}
    </span>
  );
};

const TypeSummary = ({ type, types }: { type: UnitType; types: UnitType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <>
      <TypeIcon type={type} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-sm font-medium">{type.name}</span>
          {type.code && <code className="shrink-0 text-xs text-muted-foreground">{type.code}</code>}
        </span>
        <Placement type={type} types={types} />
      </span>
      {!type.isActive && <Badge variant="muted">{t('inactive', 'Inactive')}</Badge>}
    </>
  );
};

/** Deletes one of the organisation's own types after asking; one units still have stays. */
const useRemoveType = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const handlers = useStructureHandlers();

  return useMutation(
    orpc.unitTypes.remove.mutationOptions({
      onSuccess: handlers.onSuccess,
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('remove-type-failed', 'Could not delete it'),
          description: isApiError(error, 'UNIT_TYPE_IN_USE')
            ? t(
                'type-in-use',
                '{{count}} units have this type. Give them another first, or turn the type off.',
                error.data,
              )
            : messageOf(error),
        }),
    }),
  );
};

const OwnRow = ({
  type,
  types,
  sortable,
  canManage,
  onEdit,
}: {
  type: UnitType;
  types: UnitType[];
  sortable: boolean;
  canManage: boolean;
  onEdit: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const remove = useRemoveType();

  return (
    <SortableRow
      id={type.id}
      name={type.name}
      sortable={sortable}
      className="border-b px-3 py-3 last:border-b-0"
    >
      <TypeSummary type={type} types={types} />
      {canManage && (
        <span className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('edit-type', 'Edit {{name}}', { name: type.name })}
            onClick={onEdit}
          >
            <IconPencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('delete-type', 'Delete {{name}}', { name: type.name })}
            disabled={remove.isPending}
            onClick={() =>
              void confirm({
                message: t('delete-type-confirm', 'Delete the unit type {{name}}?', {
                  name: type.name,
                }),
                options: { okLabel: t('delete', 'Delete') },
              }).then(() => remove.mutate({ id: type.id }))
            }
          >
            <IconTrash />
          </Button>
        </span>
      )}
    </SortableRow>
  );
};

/** A plugin's type: shown, but only its plugin changes it. */
const PluginRow = ({ type, types }: { type: UnitType; types: UnitType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <li className="flex items-center gap-2 border-b px-3 py-3 opacity-60 last:border-b-0">
      <TypeSummary type={type} types={types} />
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <IconLock className="size-3.5" aria-hidden />
        {t('from-plugin', 'From {{plugin}}', { plugin: type.pluginTitle ?? type.plugin })}
      </span>
    </li>
  );
};

/** Saves the own types' order after a drag: only those whose place changed. */
const useSaveOrder = () => {
  const handlers = useStructureHandlers();

  return useMutation({
    mutationFn: (changed: { id: string; order: number }[]) =>
      Promise.all(
        changed.map(({ id, order }) => orpc.unitTypes.update.call({ id, sortOrder: order })),
      ),
    ...handlers,
  });
};

const TypeList = ({ types }: { types: UnitType[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const canManage = useCan()('structure.manage');
  const [editing, setEditing] = useState<{ type: UnitType | null; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const saveOrder = useSaveOrder();
  const shown = types.filter((type) => !type.hidden);
  const own = shown.filter((type) => !type.plugin);
  const plugins = shown.filter((type) => type.plugin);

  const edit = (type: UnitType | null) => {
    setEditing((current) => ({ type, key: (current?.key ?? 0) + 1 }));
    setOpen(true);
  };

  const reorder = (ids: string[]) => {
    const items = own.map((type) => ({ id: type.id, order: type.sortOrder }));
    const next = ids.flatMap((id) => items.filter((item) => item.id === id));

    saveOrder.mutate(withOrders(items, next).changed);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t(
            'types-intro',
            'The kinds of unit your organisation uses, such as branch, department or team, and where each may sit. Drag to set their order: a new unit gets the first one that fits.',
          )}
        </p>
        {canManage && (
          <Button onClick={() => edit(null)}>
            <IconPlus />
            {t('add-type', 'Add type')}
          </Button>
        )}
      </div>
      <SortableList
        ids={own.map((type) => type.id)}
        nameOf={(id) => own.find((type) => type.id === id)?.name ?? id}
        onOrder={reorder}
        className="flex flex-col rounded-lg border"
      >
        {own.map((type) => (
          <OwnRow
            key={type.id}
            type={type}
            types={shown}
            sortable={canManage && !saveOrder.isPending}
            canManage={canManage}
            onEdit={() => edit(type)}
          />
        ))}
      </SortableList>
      {plugins.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">{t('plugin-types', 'From plugins')}</h2>
          <ul className="flex flex-col rounded-lg border">
            {plugins.map((type) => (
              <PluginRow key={type.id} type={type} types={shown} />
            ))}
          </ul>
        </section>
      )}
      {editing && (
        <UnitTypeForm
          key={editing.key}
          type={editing.type}
          types={shown}
          order={own.length}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
};

/** Settings › Structure › Unit types: the organisation's own types, then those its plugins bring. */
export const UnitTypesPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const types = useQuery(orpc.unitTypes.list.queryOptions({ input: {} }));

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
              {
                label: t('unit-types', 'Unit types'),
                to: paths.settings.unitTypes,
                icon: IconCategory,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <QueryState query={types}>{(data) => <TypeList types={data.data} />}</QueryState>
      </ScrollArea>
    </PageContainer>
  );
};
