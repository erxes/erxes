import type { ApiKeyAccess } from '@erxes/core-contract';
import { IconSearch } from '@tabler/icons-react';
import { Checkbox, cn, InputGroup, ScrollArea, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Level = 'off' | ApiKeyAccess | 'choose';

const LEVELS = ['off', 'read', 'write', 'choose'] as const satisfies readonly Level[];

/** No access, read, read and write, or only the chosen calls: one pressed at a time. */
export const LevelPicker = ({
  label,
  value,
  disabled,
  writable,
  choosable,
  onChange,
}: {
  label: string;
  value: Level;
  disabled: boolean;
  writable: boolean;
  choosable: boolean;
  onChange: (level: Level) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });

  const words: Record<Level, string> = {
    off: t('level-off', 'Off'),
    read: t('read', 'Read'),
    write: t('level-write', 'Read & write'),
    choose: t('level-choose', 'Choose'),
  };

  const usable: Record<Level, boolean> = {
    off: true,
    read: true,
    write: writable,
    choose: choosable,
  };

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      aria-label={label}
      value={[value]}
      disabled={disabled}
      onValueChange={([next]) => {
        const found = LEVELS.find((level) => level === next);

        if (found) onChange(found);
      }}
      className="w-full sm:w-auto"
    >
      {LEVELS.map((level) => (
        <ToggleGroup.Item
          key={level}
          value={level}
          disabled={!usable[level]}
          className="flex-1 sm:flex-none"
        >
          {words[level]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

/** One thing a key can be given in a picker: a call or a plugin action. */
export interface Pickable {
  name: string;
  label: string;
  /** A short tag at the end of the line, such as the HTTP method. */
  tag?: string;
  /** Shown on hover and searched, such as the path. */
  detail?: string;
  allowed: boolean;
}

/** A titled list of pickables with a box that ticks or clears them all. */
const PickGroup = ({
  title,
  items,
  ticked,
  onChange,
}: {
  title: string;
  items: Pickable[];
  ticked: readonly string[];
  onChange: (names: string[], on: boolean) => void;
}) => {
  const allowed = items.filter((item) => item.allowed).map((item) => item.name);
  const on = allowed.filter((name) => ticked.includes(name)).length;

  if (!items.length) return null;

  return (
    <div className="space-y-1">
      <label className="flex cursor-pointer items-center gap-3 px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Checkbox
          checked={on > 0 && on === allowed.length}
          indeterminate={on > 0 && on < allowed.length}
          disabled={!allowed.length}
          onCheckedChange={(next) => onChange(allowed, next)}
        />
        <span className="flex-1">{title}</span>
        <span className="font-normal tabular-nums normal-case">
          {on}/{items.length}
        </span>
      </label>
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            <label
              title={item.detail}
              className={cn(
                'flex items-start gap-3 rounded-md px-2 py-1.5 text-sm',
                item.allowed ? 'cursor-pointer hover:bg-muted' : 'opacity-60',
              )}
            >
              <Checkbox
                className="mt-0.5"
                checked={ticked.includes(item.name)}
                disabled={!item.allowed}
                onCheckedChange={(next) => onChange([item.name], next)}
              />
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.tag && (
                <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                  {item.tag}
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** The calls or actions to pick from, searchable when there are many, in titled groups. */
export const Picker = ({
  groups,
  ticked,
  disabled,
  onChange,
}: {
  groups: { title: string; items: Pickable[] }[];
  ticked: readonly string[];
  disabled: boolean;
  onChange: (ticked: string[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const [search, setSearch] = useState('');
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);

  const matches = (item: Pickable) =>
    words.every((word) =>
      `${item.label} ${item.tag ?? ''} ${item.detail ?? ''}`.toLowerCase().includes(word),
    );

  const toggle = (names: string[], on: boolean) =>
    onChange(
      on ? [...new Set([...ticked, ...names])] : ticked.filter((name) => !names.includes(name)),
    );

  return (
    <fieldset disabled={disabled} className="space-y-2 rounded-lg border bg-muted/30 p-2">
      {total > 8 && (
        <InputGroup className="h-8">
          <InputGroup.Addon>
            <IconSearch className="pointer-events-none size-3.5" />
          </InputGroup.Addon>
          <InputGroup.Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search-calls', 'Search calls')}
            aria-label={t('search-calls', 'Search calls')}
          />
        </InputGroup>
      )}
      <ScrollArea className="max-h-96">
        <div className="space-y-2 pr-2">
          {groups.map((group) => (
            <PickGroup
              key={group.title}
              title={group.title}
              items={group.items.filter(matches)}
              ticked={ticked}
              onChange={toggle}
            />
          ))}
        </div>
      </ScrollArea>
    </fieldset>
  );
};
