import {
  IconBolt,
  IconBuilding,
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconClockHour4,
  IconCreditCard,
  IconMagnet,
  IconMail,
  IconNote,
  IconPuzzle,
  IconUser,
  IconWebhook,
  type TablerIcon,
} from "@tabler/icons-react";
import { cn, Command, Popover } from "erxes-ui";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { pluginLabel } from "~/lib/members";

/**
 * Picking an event or an action out of what core and every installed plugin
 * offer, in two steps as Zapier and HubSpot do: first what it is about (a core
 * area such as Customers, or a plugin), then the event or action in it, each
 * with a line on what it does. Recently used come first; search looks across
 * everything (or within the open category).
 */

export interface CatalogItem {
  /** `core.customer.created`, `hr.leave.approved`, `core.email.send` … */
  type: string;
  label: string;
  description?: string | null;
  /** `core` or the plugin. */
  source: string;
}

interface Group {
  key: string;
  source?: string;
  label: string;
  icon: TablerIcon;
  order: number;
}

/** Core's areas, by the second part of the type (`core.<area>.…`), in this order. */
const CORE_AREAS: Record<string, Omit<Group, "key">> = {
  customer: { label: "Customers", icon: IconUser, order: 0 },
  lead: { label: "Leads", icon: IconMagnet, order: 1 },
  company: { label: "Companies", icon: IconBuilding, order: 2 },
  payment: { label: "Payments", icon: IconCreditCard, order: 3 },
  email: { label: "Messages", icon: IconMail, order: 4 },
  notification: { label: "Messages", icon: IconMail, order: 4 },
  note: { label: "Timeline", icon: IconNote, order: 5 },
  webhook: { label: "Integrations", icon: IconWebhook, order: 6 },
  http: { label: "Integrations", icon: IconWebhook, order: 6 },
};

const groupOf = (item: CatalogItem): Group => {
  if (item.source !== "core")
    return {
      key: `plugin:${item.source}`,
      source: item.source,
      label: pluginLabel(item.source),
      icon: IconPuzzle,
      order: 100,
    };

  const area = CORE_AREAS[item.type.split(".")[1] ?? ""];

  return area
    ? { key: `core:${area.label}`, source: "core", ...area }
    : {
        key: "core:general",
        source: "core",
        label: "General",
        icon: IconBolt,
        order: 50,
      };
};

/** Every word typed appears in the name, description, area or app (not cmdk's loose fuzzy match). */
const matchWords = (value: string, search: string, keywords?: string[]) => {
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();

  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
    ? 1
    : 0;
};

const RECENT_LIMIT = 4;

/** The last few picked of a kind, in this browser. */
const useRecent = (kind: string) => {
  const key = `erxes_automation_recent_${kind}`;
  const read = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    } catch {
      return [];
    }
  };
  const [recent, setRecent] = useState(read);

  const remember = (type: string) => {
    const next = [type, ...recent.filter((item) => item !== type)].slice(
      0,
      RECENT_LIMIT,
    );

    setRecent(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private mode: no memory, still works.
    }
  };

  return { recent, remember };
};

const Row = ({
  item,
  selected,
  onSelect,
  keyPrefix = "",
  showIcon = false,
}: {
  item: CatalogItem;
  selected: boolean;
  onSelect: () => void;
  keyPrefix?: string;
  /** Recently used mixes areas: each row shows its own. */
  showIcon?: boolean;
}) => {
  const group = groupOf(item);

  return (
    <Command.Item
      value={`${keyPrefix}${item.type}`}
      keywords={[item.label, item.description ?? "", group.label, item.source]}
      onSelect={onSelect}
      className="h-auto items-start gap-2.5 px-2.5 py-1.5"
    >
      {showIcon && (
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <group.icon className="size-3.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{item.label}</span>
        {item.description && (
          <span className="block truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
      {selected && <IconCheck className="mt-1 size-4 shrink-0 text-primary" />}
    </Command.Item>
  );
};

export const CatalogPicker = ({
  kind,
  items,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  /** Which list (`event`, `action`): recents are kept per kind. */
  kind: string;
  items: CatalogItem[];
  value: string | undefined;
  onChange: (type: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const { t } = useTranslation("automations");
  const [open, setOpen] = useState(false);
  // Two steps, as Zapier and HubSpot: what it is about (a category), then the event or action in it.
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { recent, remember } = useRecent(kind);
  const selected = items.find((item) => item.type === value);
  const groups = useMemo(() => {
    const byKey = new Map<string, { group: Group; items: CatalogItem[] }>();

    for (const item of items) {
      const group = groupOf(item);
      const entry = byKey.get(group.key) ?? { group, items: [] };

      entry.items.push(item);
      byKey.set(group.key, entry);
    }

    return [...byKey.values()].sort(
      (a, b) =>
        a.group.order - b.group.order ||
        a.group.label.localeCompare(b.group.label),
    );
  }, [items]);
  const current = groups.find((entry) => entry.group.key === category) ?? null;
  const recentItems = recent
    .map((type) => items.find((item) => item.type === type))
    .filter((item): item is CatalogItem => Boolean(item));
  const groupName = (group: Group) =>
    group.source === "core"
      ? t(`catalog-group.${group.label}`, group.label)
      : group.label;
  const countLabel = (count: number) =>
    kind === "action"
      ? t("catalog-count-action", {
          count,
          defaultValue_one: "{{count}} action",
          defaultValue_other: "{{count}} actions",
        })
      : t("catalog-count-event", {
          count,
          defaultValue_one: "{{count}} event",
          defaultValue_other: "{{count}} events",
        });
  const choose = (type: string) => {
    remember(type);
    onChange(type);
    setOpen(false);
  };
  const SelectedIcon = selected ? groupOf(selected).icon : IconBolt;
  const searching = search.trim().length > 0;
  // Searching from the categories looks everywhere; inside one, only there.
  const searchGroups = current ? [current] : groups;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch("");
        // Reopening shows the chosen one's category, as you left it.
        setCategory(next && selected ? groupOf(selected).key : null);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-auto min-h-9 w-full items-center gap-2.5 rounded-md border bg-background px-2.5 py-1.5 text-left shadow-xs transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:border-primary/40"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SelectedIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            {selected ? (
              <>
                <span className="block truncate text-xs text-muted-foreground">
                  {groupName(groupOf(selected))}
                </span>
                <span className="block truncate text-sm font-medium">
                  {selected.label}
                </span>
              </>
            ) : (
              <span className="block truncate text-sm text-muted-foreground">
                {value ||
                  placeholder ||
                  (kind === "action"
                    ? t("catalog-choose-action", "Choose an action")
                    : t("catalog-choose-event", "Choose an event"))}
              </span>
            )}
          </span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        sideOffset={6}
        className="w-(--radix-popper-anchor-width) min-w-80 max-w-[40rem] p-0"
      >
        <Command loop filter={matchWords} shouldFilter={searching}>
          {current && (
            <div className="flex items-center gap-2 border-b px-2 py-1.5">
              <button
                type="button"
                onClick={() => {
                  setCategory(null);
                  setSearch("");
                }}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={t("catalog-back", "All categories")}
              >
                <IconArrowLeft className="size-4" />
              </button>
              <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <current.group.icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {groupName(current.group)}
              </span>
              <span className="text-xs text-muted-foreground">
                {countLabel(current.items.length)}
              </span>
            </div>
          )}
          <Command.Input
            value={search}
            onValueChange={setSearch}
            onKeyDown={(event) => {
              // Backspace on an empty search goes back to the categories.
              if (event.key === "Backspace" && !search && current)
                setCategory(null);
            }}
            placeholder={
              current
                ? t("catalog-search-in", {
                    name: groupName(current.group),
                    defaultValue: "Search in {{name}}…",
                  })
                : kind === "action"
                  ? t("catalog-search-actions", "Search actions…")
                  : t("catalog-search-events", "Search events…")
            }
          />
          <Command.List className="max-h-80">
            <Command.Empty>
              {t("catalog-empty", "Nothing matches")}
            </Command.Empty>

            {searching &&
              searchGroups.map(({ group, items: groupItems }) => (
                <Command.Group
                  key={group.key}
                  heading={
                    <span className="flex items-center gap-1.5">
                      <group.icon className="size-3.5" />
                      {groupName(group)}
                    </span>
                  }
                >
                  {groupItems.map((item) => (
                    <Row
                      key={item.type}
                      item={item}
                      selected={item.type === value}
                      onSelect={() => choose(item.type)}
                    />
                  ))}
                </Command.Group>
              ))}

            {!searching && current && (
              <Command.Group>
                {current.items.map((item) => (
                  <Row
                    key={item.type}
                    item={item}
                    selected={item.type === value}
                    onSelect={() => choose(item.type)}
                  />
                ))}
              </Command.Group>
            )}

            {!searching && !current && (
              <>
                {recentItems.length > 0 && (
                  <Command.Group
                    heading={
                      <span className="flex items-center gap-1">
                        <IconClockHour4 className="size-3" />
                        {t("catalog-recent", "Recently used")}
                      </span>
                    }
                  >
                    {recentItems.map((item) => (
                      <Row
                        key={`recent:${item.type}`}
                        keyPrefix="recent:"
                        showIcon
                        item={item}
                        selected={item.type === value}
                        onSelect={() => choose(item.type)}
                      />
                    ))}
                  </Command.Group>
                )}
                <Command.Group
                  heading={t("catalog-categories", "Categories")}
                  className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-2 [&_[cmdk-group-items]]:gap-1"
                >
                  {groups.map(({ group, items: groupItems }) => (
                    <Command.Item
                      key={group.key}
                      value={`category:${group.key}`}
                      onSelect={() => {
                        setCategory(group.key);
                        setSearch("");
                      }}
                      className={cn(
                        "h-auto gap-2.5 rounded-md border border-transparent px-2 py-2",
                        selected &&
                          groupOf(selected).key === group.key &&
                          "border-primary/30 bg-primary/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
                          group.source !== "core" &&
                            "bg-primary/10 text-primary",
                        )}
                      >
                        <group.icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {groupName(group)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {group.source !== "core"
                            ? `${t("catalog-plugin", "Plugin")} · `
                            : ""}
                          {countLabel(groupItems.length)}
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
