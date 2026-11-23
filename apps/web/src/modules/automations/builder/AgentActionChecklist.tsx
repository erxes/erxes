import { STEP_ONLY_ACTIONS } from '@erxes/core-contract/values';
import { Checkbox, Command } from 'erxes-ui';
import { useContext, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { CatalogList, type Picked } from './CatalogList';
import { CategoryHeader } from './CatalogPicker';
import {
  type CatalogItem,
  type GroupEntry,
  groupItems,
  groupOf,
  matchWords,
} from './catalogGroups';

/**
 * Ticks and unticks in `chosen`, a list of category keys (every action in it, later ones too)
 * and single action types. Ticking a category's last action stores the category; unticking one
 * action of a ticked category keeps its others.
 */
const useChecklist = (groups: GroupEntry[], chosen: string[]) => {
  const has = new Set(chosen);
  const isPicked = (item: CatalogItem) => has.has(item.type) || has.has(groupOf(item).key);
  const entryOf = (key: string) => groups.find((entry) => entry.group.key === key);

  const pickedIn = (entry: GroupEntry) =>
    has.has(entry.group.key) ? entry.items.length : entry.items.filter(isPicked).length;

  const without = (entry: GroupEntry) =>
    chosen.filter(
      (key) => key !== entry.group.key && !entry.items.some((item) => item.type === key),
    );

  const toggleCategory = (key: string) => {
    const entry = entryOf(key);

    if (!entry) return chosen;

    return pickedIn(entry) === entry.items.length ? without(entry) : [...without(entry), key];
  };

  const toggleItem = (type: string) => {
    const entry = groups.find(({ items }) => items.some((item) => item.type === type));

    if (!entry) return chosen;

    const types = entry.items.filter(isPicked).map((item) => item.type);
    const next = types.includes(type) ? types.filter((item) => item !== type) : [...types, type];

    return [...without(entry), ...(next.length === entry.items.length ? [entry.group.key] : next)];
  };

  const picked: Picked = {
    item: isPicked,
    category: (key) => {
      const entry = entryOf(key);

      return entry ? pickedIn(entry) > 0 : false;
    },
  };

  return { picked, pickedIn, toggleCategory, toggleItem };
};

/** The action picker's categories and actions, where each tick adds to what the agent may run. */
export const AgentActionChecklist = ({
  chosen,
  onChange,
}: {
  chosen: string[];
  onChange: (next: string[]) => void;
}) => {
  const { t } = useTranslation('automations');
  const { knownActions } = useContext(BuilderContext);
  const id = useId();
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const groups = useMemo(
    () => groupItems(knownActions.filter((action) => !STEP_ONLY_ACTIONS.has(action.type))),
    [knownActions],
  );

  const current = groups.find((entry) => entry.group.key === category) ?? null;
  const { picked, pickedIn, toggleCategory, toggleItem } = useChecklist(groups, chosen);

  const change = (next: string[]) => {
    if (next.length) onChange(next);
  };

  const pickedHint = (entry: GroupEntry) => {
    const count = pickedIn(entry);

    if (count === entry.items.length) return t('agent-tools-all-of', 'All {{count}}', { count });

    return count
      ? t('agent-tools-some-of', '{{count}} of {{total}}', { count, total: entry.items.length })
      : t('agent-tools-none-of', 'None of {{total}}', { total: entry.items.length });
  };

  const openCategory = (next: string | null) => {
    setCategory(next);
    setSearch('');
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Command loop filter={matchWords} shouldFilter={search.trim().length > 0}>
        {current && (
          <CategoryHeader
            kind="action"
            current={current}
            onBack={() => openCategory(null)}
            trailing={
              <label htmlFor={`${id}-all`} className="flex items-center gap-1.5 text-xs">
                <Checkbox
                  id={`${id}-all`}
                  checked={pickedIn(current) === current.items.length}
                  onCheckedChange={() => change(toggleCategory(current.group.key))}
                />
                {t('agent-tools-all-in', 'All')}
              </label>
            }
          />
        )}
        <Command.Input
          value={search}
          onValueChange={setSearch}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !search && current) setCategory(null);
          }}
          placeholder={t('agent-tools-search', 'Find an action')}
        />
        <CatalogList
          kind="action"
          groups={groups}
          current={current}
          searching={search.trim().length > 0}
          picked={picked}
          recentItems={[]}
          categoryHint={pickedHint}
          onChoose={(type) => change(toggleItem(type))}
          onOpen={openCategory}
        />
      </Command>
    </div>
  );
};
