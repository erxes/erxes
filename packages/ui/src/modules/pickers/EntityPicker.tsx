import { type ReactNode, useState } from 'react';
import { Combobox } from '../../components/combobox';
import { Command } from '../../components/command';

/*
 * The one searchable list behind every record picker (members, contacts, tags, a plugin's own
 * records): search, the picked ones first, a check on each, and optional "none" and "create"
 * rows. Each picker brings its own trigger (a table cell, a form control, a button) and its
 * items, usually from `useQuery(orpc.<group>.list.queryOptions(...))`.
 */

interface EntityPickerProps<T, K extends string> {
  items: T[];
  /** The id and the text a search matches. */
  itemKey: (item: T) => { id: K; label: string };
  /** How an item reads in the list; its label by default. */
  renderItem?: (item: T) => ReactNode;
  value: K[];
  /** The picked ids. One pick replaces the value unless `multiple`, where it toggles. */
  onValueChange: (ids: K[]) => void;
  multiple?: boolean;
  /** Items keep their order (a tree reads top down); otherwise the picked ones come first. */
  keepOrder?: boolean;
  loading?: boolean;
  error?: Error | null;
  /** Searching on the server: `items` are already the matches, so they are not filtered here. */
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  /** A first row that picks nothing. */
  noneLabel?: string;
  /** Above the list, e.g. the picked tags as badges. */
  header?: ReactNode;
  /** A row for what was searched, e.g. "Add tag: VIP"; `clear` empties the search. */
  renderCreate?: (search: string, clear: () => void) => ReactNode;
}

export const EntityPicker = <T, K extends string = string>({
  items,
  itemKey,
  renderItem,
  value,
  onValueChange,
  multiple,
  keepOrder,
  loading,
  error,
  onSearchChange,
  searchPlaceholder,
  noneLabel,
  header,
  renderCreate,
}: EntityPickerProps<T, K>) => {
  const [search, setSearch] = useState('');
  // The ones picked when the list opened come first; a pick then checks a row without moving it.
  const [pickedAtOpen] = useState(value);
  const term = search.trim().toLowerCase();

  const matches = items
    .map((item) => ({ item, ...itemKey(item) }))
    .filter((row) => onSearchChange !== undefined || row.label.toLowerCase().includes(term));

  const rows = keepOrder
    ? matches
    : matches.toSorted(
        (a, b) => Number(pickedAtOpen.includes(b.id)) - Number(pickedAtOpen.includes(a.id)),
      );

  const pick = (id: K) =>
    onValueChange(
      !multiple ? [id] : value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );

  const changeSearch = (next: string) => {
    setSearch(next);
    onSearchChange?.(next);
  };

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={changeSearch}
        placeholder={searchPlaceholder}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      {header}
      {/* Outside the list: the "none" or picked rows would otherwise hide a failed load. */}
      {error && (
        <p role="alert" className="text-destructive px-3 py-2 text-sm">
          {error.message}
        </p>
      )}
      <Command.List className="max-h-75 overflow-y-auto">
        {noneLabel && !term && (
          <Command.Item value="__none__" onSelect={() => onValueChange([])}>
            <span className="text-muted-foreground">{noneLabel}</span>
            <Combobox.Check checked={value.length === 0} />
          </Command.Item>
        )}
        {renderCreate?.(search.trim(), () => changeSearch(''))}
        {!error && <Combobox.Empty loading={loading} />}
        {rows.map(({ item, id, label }) => (
          <Command.Item key={id} value={id} onSelect={() => pick(id)}>
            {renderItem ? renderItem(item) : label}
            <Combobox.Check checked={value.includes(id)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
