import type { UnitNode } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { keepPreviousData, skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { cn, Combobox, EntityPicker, Popover } from 'erxes-ui';
import { type ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { nodeOf } from './unitTree';

type Choice = { unit: UnitNode; path: string[] };

/** Units' names by id, each read once and cached. */
export const useUnitNames = (ids: string[]) =>
  useQueries({
    queries: ids.map((id) => orpc.units.get.queryOptions({ input: { id }, staleTime: 60_000 })),
    combine: (results) =>
      new Map(
        results.flatMap((result) => (result.data ? [[result.data.id, result.data.name]] : [])),
      ),
  });

/**
 * Units matching what is typed, searched on the server; before anything is typed, the
 * organisation's own unit (with `withRoot`) and the units right under it.
 */
const useChoices = (search: string, withRoot: boolean) => {
  const root = useQuery(orpc.units.root.queryOptions({ input: {} }));

  const top = useQuery(
    orpc.units.children.queryOptions({
      input: !search && root.data ? { id: root.data.id, limit: 50 } : skipToken,
    }),
  );

  const hits = useQuery({
    ...orpc.units.search.queryOptions({ input: search ? { q: search, limit: 20 } : skipToken }),
    placeholderData: keepPreviousData,
  });

  if (search)
    return {
      choices: (hits.data?.data ?? []).map((hit): Choice => ({
        unit: hit,
        path: hit.ancestorNames,
      })),
      pending: hits.isPending,
      error: hits.error,
    };

  const rootNode = root.data ? nodeOf(root.data) : null;

  return {
    choices: [
      ...(withRoot && rootNode ? [{ unit: rootNode, path: [] }] : []),
      ...(top.data?.data ?? []).map((unit): Choice => ({
        unit,
        path: rootNode ? [rootNode.name] : [],
      })),
    ],
    pending: root.isPending || top.isPending,
    error: root.error ?? top.error,
  };
};

const UnitChoices = ({
  value,
  onValueChange,
  multiple,
  withRoot = false,
  exclude,
}: {
  value: string[];
  /** The picked ids, and the unit whose row was just clicked. */
  onValueChange: (ids: string[], clicked: UnitNode | undefined) => void;
  multiple?: boolean;
  withRoot?: boolean;
  exclude?: (unit: UnitNode) => boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [search, setSearch] = useState('');
  const [term] = useDebounce(search.trim(), 250);
  const { choices, pending, error } = useChoices(term, withRoot);
  const shown = choices.filter((choice) => !exclude?.(choice.unit));

  const change = (ids: string[]) => {
    const clicked = shown.find(
      ({ unit }) => ids.includes(unit.id) !== value.includes(unit.id),
    )?.unit;

    onValueChange(ids, clicked);
  };

  return (
    <EntityPicker
      items={shown}
      keepOrder
      itemKey={(choice) => ({ id: choice.unit.id, label: choice.unit.name })}
      renderItem={(choice) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{choice.unit.name}</span>
          {choice.path.length > 0 && (
            <span className="truncate text-xs text-muted-foreground">
              {choice.path.join(' › ')}
            </span>
          )}
        </span>
      )}
      value={value}
      onValueChange={change}
      multiple={multiple}
      loading={pending}
      error={error}
      onSearchChange={setSearch}
      searchPlaceholder={t('search-units', 'Search units')}
    />
  );
};

type TriggerProps = {
  id?: string;
  disabled?: boolean;
  placeholder: string;
  variant?: ComponentProps<typeof Combobox.Trigger>['variant'];
  className?: string;
};

/** One unit, searched on the server; `exclude` hides units that can't be picked. */
export const UnitPicker = ({
  value,
  onChange,
  exclude,
  withRoot,
  ...trigger
}: TriggerProps & {
  value: string | null;
  onChange: (unit: UnitNode) => void;
  exclude?: (unit: UnitNode) => boolean;
  withRoot?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const names = useUnitNames(value ? [value] : []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger
        id={trigger.id}
        disabled={trigger.disabled}
        variant={trigger.variant}
        className={cn('h-8', trigger.className)}
      >
        <Combobox.Value
          value={value ? names.get(value) : undefined}
          placeholder={trigger.placeholder}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <UnitChoices
          value={value ? [value] : []}
          withRoot={withRoot}
          exclude={exclude}
          onValueChange={(_ids, clicked) => {
            if (clicked) onChange(clicked);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

/** Several units, searched on the server. */
export const UnitMultiPicker = ({
  value,
  onChange,
  ...trigger
}: TriggerProps & { value: string[]; onChange: (ids: string[]) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const names = useUnitNames(value);

  const label = value.length
    ? value.map((id) => names.get(id) ?? t('loading', 'Loading…')).join(', ')
    : undefined;

  return (
    <Popover>
      <Combobox.Trigger
        id={trigger.id}
        disabled={trigger.disabled}
        variant={trigger.variant}
        className={cn('h-8', trigger.className)}
      >
        <Combobox.Value value={label} placeholder={trigger.placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <UnitChoices value={value} onValueChange={onChange} multiple />
      </Combobox.Content>
    </Popover>
  );
};
