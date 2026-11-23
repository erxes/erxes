import { Combobox, Command, Popover } from 'erxes-ui';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { CatalogList, type Picked, RECENT } from './CatalogList';
import {
  type CatalogItem,
  type GroupEntry,
  groupItems,
  groupOf,
  matchWords,
  useCatalogLabels,
  useRecent,
} from './catalogGroups';

/*
 * Picking an event or an action out of what core, the installed plugins and the connected apps
 * offer: the categories on the left, the open one's items on the right, each with a line on what
 * it does. It opens at the chosen item's category (else the recently used, else the first).
 * Search looks across everything.
 */

type PickerProps = {
  /** Which list (`event`, `action`): recents are kept per kind. */
  kind: string;
  items: CatalogItem[];
  value: string | undefined;
  onChange: (type: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

/** The chosen item, then the recently used others. */
const currentThenRecent = (
  items: CatalogItem[],
  selected: CatalogItem | undefined,
  recent: string[],
) => [
  ...(selected ? [selected] : []),
  ...recent.flatMap(
    (type) =>
      items.find(
        (item) => item.type === type && item.type !== selected?.type && !item.comingSoon,
      ) ?? [],
  ),
];

/** The one chosen item, and its category. */
const pickedOne = (value: string | undefined, selected: CatalogItem | undefined): Picked => ({
  item: (item) => item.type === value,
  category: (key) => (selected ? groupOf(selected).key === key : false),
});

/** Where the picker opens: the chosen item's category, else the recently used, else the first. */
const startCategory = (
  groups: GroupEntry[],
  selected: CatalogItem | undefined,
  recentCount: number,
) => {
  if (selected) return groupOf(selected).key;

  return recentCount > 0 ? RECENT : (groups[0]?.group.key ?? null);
};

/** The button showing the chosen item and its area. */
const PickerTrigger = ({
  kind,
  selected,
  value,
  placeholder,
  disabled,
}: Pick<PickerProps, 'kind' | 'value' | 'placeholder' | 'disabled'> & {
  selected: CatalogItem | undefined;
}) => {
  const { t } = useTranslation('automations');
  const { groupName } = useCatalogLabels(kind);

  const fallback =
    kind === 'action'
      ? t('catalog-choose-action', 'Choose an action')
      : t('catalog-choose-event', 'Choose an event');

  return (
    <Combobox.Trigger disabled={disabled} className="h-auto min-h-9">
      <span className="min-w-0 flex-1">
        {selected ? (
          <>
            <span className="block truncate text-xs text-muted-foreground">
              {groupName(groupOf(selected))}
            </span>
            <span className="block truncate text-sm font-medium">{selected.label}</span>
          </>
        ) : (
          <span className="block truncate text-sm text-muted-foreground">
            {value || placeholder || fallback}
          </span>
        )}
      </span>
    </Combobox.Trigger>
  );
};

export const CatalogPicker = ({
  kind,
  items,
  value,
  onChange,
  disabled,
  placeholder,
}: PickerProps) => {
  const { searchPlaceholder, pickerLabel } = useCatalogLabels(kind);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { recent, remember } = useRecent(kind);
  const selected = items.find((item) => item.type === value);
  const { knownActions } = useContext(BuilderContext);
  const shown = selected ?? knownActions.find((item) => kind === 'action' && item.type === value);
  const groups = useMemo(() => groupItems(items), [items]);
  const recentItems = currentThenRecent(items, selected, recent);
  const searching = search.trim().length > 0;

  const openCategory = (next: string) => {
    setCategory(next);
    setSearch('');
  };

  const choose = (type: string) => {
    remember(type);
    onChange(type);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch('');
        setCategory(startCategory(groups, selected, recentItems.length));
      }}
    >
      <PickerTrigger
        kind={kind}
        selected={shown}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Popover.Content
        aria-label={pickerLabel}
        align="start"
        sideOffset={6}
        collisionPadding={12}
        // Never taller than the room on its side: the list scrolls instead of
        // the search being pushed off screen.
        variant="flush"
        className="flex max-h-(--available-height) w-(--anchor-width) min-w-120 max-w-180 flex-col"
      >
        <Command loop filter={matchWords} shouldFilter={searching} className="min-h-0 flex-1">
          <Command.Input value={search} onValueChange={setSearch} placeholder={searchPlaceholder} />
          <CatalogList
            kind={kind}
            groups={groups}
            category={category}
            searching={searching}
            picked={pickedOne(value, selected)}
            recentItems={recentItems}
            onChoose={choose}
            onOpen={openCategory}
          />
        </Command>
      </Popover.Content>
    </Popover>
  );
};
