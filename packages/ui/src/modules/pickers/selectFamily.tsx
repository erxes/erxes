import type { ComponentType } from 'react';
import { Badge } from 'erxes-ui/components/badge';
import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { SelectTree } from './SelectTree';

/*
 * 3.x's record pickers (`SelectBranches`, `SelectProduct`, `SelectCustomer` …) share one shape:
 * a table cell, a form field and three filter parts, around one searchable list. A family is
 * built from a spec of how it reads its records (`pickerFamily` in selectFamilyParts.tsx); the
 * views here draw what the family's hooks read.
 */

/** One record or several: a `single` pick replaces the value, a `multiple` one toggles. */
export type PickerMode = 'single' | 'multiple';

/** The picked id (`single`), or ids (`multiple`). */
export type PickerValue = string | string[] | null | undefined;

export interface ListState<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
}

export interface PickerTexts {
  search: string;
  placeholder: string;
  count: (count: number) => string;
}

/** How a family's records read: their key, their row, their place in a tree. */
export interface PickerLook<T> {
  /** The id `SelectTree` keeps its fold state under. */
  name: string;
  itemKey: (item: T) => { id: string; label: string };
  /** How a record reads in the list and as the picked value. */
  Item: ComponentType<{ item: T }>;
  /** Its place in a tree, for a list that folds while it isn't searched. */
  treeOf?: (item: T) => { order: string; hasChildren: boolean };
  /** The list is already the search's matches, so it isn't filtered here. */
  serverSearch?: boolean;
}

/** The props every part takes besides the records' own. */
export interface PickerProps {
  value: PickerValue;
  onValueChange?: (value: string | string[] | undefined) => void;
  mode?: PickerMode;
  placeholder?: string;
  /** A field that shows the pick and can't be changed (a form the member can only read). */
  disabled?: boolean;
}

export const idsOf = (value: PickerValue) => (Array.isArray(value) ? value : value ? [value] : []);

/** The value after a pick: one id toggles off, several toggle in or out. */
const picked = (value: PickerValue, id: string, mode: PickerMode) => {
  const ids = idsOf(value);

  if (mode === 'single') return ids.includes(id) ? undefined : id;

  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
};

/** A picked record, or its id when it no longer loads. */
const Picked = <T,>({
  id,
  item,
  Item,
  onRemove,
}: {
  id: string;
  item?: T;
  Item: ComponentType<{ item: T }>;
  onRemove?: () => void;
}) =>
  item ? (
    <Badge variant="secondary" className="min-w-0" onClose={onRemove}>
      <Item item={item} />
    </Badge>
  ) : (
    <Badge variant="secondary" className="max-w-24 font-mono" onClose={onRemove}>
      <span className="truncate">{id}</span>
    </Badge>
  );

/**
 * The picked records: one as text, several as badges, past one in `multiple` a count. A single
 * pick that no longer loads shows the placeholder.
 */
export const PickerValueView = <T,>({
  look,
  texts,
  byId,
  loading,
  value,
  mode = 'single',
  placeholder,
}: Pick<PickerProps, 'value' | 'mode' | 'placeholder'> & {
  look: PickerLook<T>;
  texts: PickerTexts;
  byId: Map<string, T>;
  loading: boolean;
}) => {
  const ids = idsOf(value);
  const first = ids[0] ?? '';
  const item = byId.get(first);

  if (!ids.length) return <Combobox.Value placeholder={placeholder ?? texts.placeholder} />;

  if (loading) return <Combobox.Value loading />;

  if (mode === 'multiple' && ids.length > 1) {
    return <span className="text-muted-foreground">{texts.count(ids.length)}</span>;
  }

  if (mode === 'multiple') return <Picked id={first} item={item} Item={look.Item} />;

  // A record that no longer loads (a deleted branch) shows the placeholder, as 3.x showed nothing.
  return item ? (
    <look.Item item={item} />
  ) : (
    <Combobox.Value placeholder={placeholder ?? texts.placeholder} />
  );
};

/** The records to pick, as a tree that folds while the list is unsearched and has one. */
const PickerRows = <T,>({
  look,
  rows,
  ordered,
  onPick,
}: {
  look: PickerLook<T>;
  rows: { item: T; id: string; label: string }[];
  ordered: boolean;
  onPick: (id: string) => void;
}) => (
  <SelectTree.Provider
    id={look.name}
    ordered={Boolean(look.treeOf) && ordered}
    length={rows.length}
  >
    {rows.map(({ item, id, label }) => {
      const tree = look.treeOf?.(item);

      return tree ? (
        <SelectTree.Item
          key={id}
          value={id}
          name={label}
          order={tree.order}
          hasChildren={tree.hasChildren}
          onSelect={() => onPick(id)}
        >
          <look.Item item={item} />
        </SelectTree.Item>
      ) : (
        <Command.Item key={id} value={id} onSelect={() => onPick(id)}>
          <look.Item item={item} />
        </Command.Item>
      );
    })}
  </SelectTree.Provider>
);

/** The searchable list, the picked records on top as badges that unpick. */
export const PickerListView = <T,>({
  look,
  texts,
  byId,
  list,
  search,
  onSearchChange,
  value,
  onValueChange,
  mode = 'single',
  onPick,
}: PickerProps & {
  look: PickerLook<T>;
  texts: PickerTexts;
  byId: Map<string, T>;
  list: ListState<T>;
  search: string;
  onSearchChange: (search: string) => void;
  onPick?: () => void;
}) => {
  const term = search.trim().toLowerCase();
  const ids = idsOf(value);

  const pick = (id: string) => {
    onValueChange?.(picked(value, id, mode));
    onPick?.();
  };

  const rows = list.items
    .map((item) => ({ item, ...look.itemKey(item) }))
    .filter((row) => !ids.includes(row.id))
    .filter((row) => look.serverSearch === true || row.label.toLowerCase().includes(term));

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={onSearchChange}
        placeholder={texts.search}
        focusOnMount
      />
      <Command.List>
        {ids.length > 0 && (
          <>
            <div className="flex flex-wrap justify-start gap-2 p-2">
              {ids.map((id) => (
                <Picked
                  key={id}
                  id={id}
                  item={byId.get(id)}
                  Item={look.Item}
                  onRemove={() => pick(id)}
                />
              ))}
            </div>
            <Command.Separator />
          </>
        )}
        <Combobox.Empty loading={list.loading} error={list.error} />
        <PickerRows look={look} rows={rows} ordered={!term} onPick={pick} />
      </Command.List>
    </Command>
  );
};
