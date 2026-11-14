import { IconArrowLeft, IconBolt } from '@tabler/icons-react';
import { Combobox, Command, Popover } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CatalogList } from './CatalogList';
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
 * Picking an event or an action out of what core and every installed plugin offer, in two
 * steps as Zapier and HubSpot do: first what it is about (a core area such as Customers, or
 * a plugin), then the event or action in it, each with a line on what it does. Recently
 * used come first; search looks across everything (or within the open category).
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
  const SelectedIcon = selected ? groupOf(selected).icon : IconBolt;

  const fallback =
    kind === 'action'
      ? t('catalog-choose-action', 'Choose an action')
      : t('catalog-choose-event', 'Choose an event');

  return (
    <Combobox.Trigger disabled={disabled} className="h-auto min-h-9">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary-text">
        <SelectedIcon className="size-4" />
      </span>
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

/** The open category's name and size, with a way back to all categories. */
const CategoryHeader = ({
  kind,
  current,
  onBack,
}: {
  kind: string;
  current: GroupEntry;
  onBack: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { groupName, countLabel } = useCatalogLabels(kind);

  return (
    <div className="flex items-center gap-2 border-b px-2 py-1.5">
      <button
        type="button"
        onClick={onBack}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={t('catalog-back', 'All categories')}
      >
        <IconArrowLeft className="size-4" />
      </button>
      <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <current.group.icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {groupName(current.group)}
      </span>
      <span className="text-xs text-muted-foreground">{countLabel(current.items.length)}</span>
    </div>
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
  const { searchPlaceholder } = useCatalogLabels(kind);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { recent, remember } = useRecent(kind);
  const selected = items.find((item) => item.type === value);
  const groups = useMemo(() => groupItems(items), [items]);
  const current = groups.find((entry) => entry.group.key === category) ?? null;
  const searching = search.trim().length > 0;

  const openCategory = (next: string | null) => {
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
        // Reopening shows the chosen one's category, as you left it.
        openCategory(next && selected ? groupOf(selected).key : null);
      }}
    >
      <PickerTrigger
        kind={kind}
        selected={selected}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Popover.Content
        align="start"
        sideOffset={6}
        collisionPadding={12}
        // Never taller than the room on its side: the list scrolls instead of
        // the header and search being pushed off screen.
        variant="flush"
        className="flex max-h-(--available-height) w-(--anchor-width) min-w-80 max-w-[40rem] flex-col"
      >
        <Command loop filter={matchWords} shouldFilter={searching} className="min-h-0 flex-1">
          {current && (
            <CategoryHeader kind={kind} current={current} onBack={() => openCategory(null)} />
          )}
          <Command.Input
            value={search}
            onValueChange={setSearch}
            onKeyDown={(event) => {
              // Backspace on an empty search goes back to the categories.
              if (event.key === 'Backspace' && !search && current) setCategory(null);
            }}
            placeholder={searchPlaceholder(current?.group)}
          />
          <CatalogList
            kind={kind}
            groups={groups}
            current={current}
            searching={searching}
            value={value}
            selected={selected}
            recentItems={recent.flatMap((type) => items.find((item) => item.type === type) ?? [])}
            onChoose={choose}
            onOpen={openCategory}
          />
        </Command>
      </Popover.Content>
    </Popover>
  );
};
