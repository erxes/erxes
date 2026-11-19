import {
  type Icon,
  IconAdjustmentsHorizontal,
  IconLayoutKanban,
  IconList,
  IconTable,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../../components/button';
import { IconTip } from '../../components/icon-tip';
import { Popover } from '../../components/popover';
import { ToggleGroup } from '../../components/toggle-group';
import { storedFamily } from '../../lib/stored';
import { cn } from '../../lib/utils';

/**
 * How a list shows its records: grouped rows, a table or a board.
 * Grouped rows are `RecordList`; a board shows cards.
 */
export type TListDisplay = 'list' | 'table' | 'board';

/**
 * A list's own display, such as a cards grid or a chart.
 * It shows in `DisplayMenu` beside the built-in ones:
 * `{ key: 'cards', label: t('cards', 'Cards'), icon: IconLayoutGrid }`. The list renders it
 * when `useListDisplay` returns its `key`.
 */
export interface TListDisplayOption<K extends string = string> {
  key: K;
  label: string;
  icon: Icon;
}

/** The displays a list offers, in the menu's order; the first shows until one is chosen. */
type ListDisplays<K extends string> = readonly [
  TListDisplay | TListDisplayOption<K>,
  ...(TListDisplay | TListDisplayOption<K>)[],
];

const TABLE_AND_BOARD: ListDisplays<never> = ['table', 'board'];

const keyOf = <K extends string>(display: TListDisplay | TListDisplayOption<K>) =>
  typeof display === 'string' ? display : display.key;

/** Null until the member picks one. */
const listDisplayFamily = storedFamily<string | null>({
  key: 'erxes:list-display',
  schema: z.string().nullable(),
  initial: null,
});

/**
 * The display a list shows, as picked in its Display menu.
 * `const [display] = useListDisplay('sales-deals')`. The choice is remembered in this browser,
 * one per list. Give it the same `displays` as the list's `DisplayMenu`; a list's own display
 * comes back as its `key`.
 */
export const useListDisplay = <const K extends string = never>(
  list: string,
  displays: ListDisplays<K> = TABLE_AND_BOARD,
) => {
  const [chosen, setDisplay] = useAtom(listDisplayFamily(list));
  const display = displays.map(keyOf).find((key) => key === chosen) ?? keyOf<K>(displays[0]);

  return [display, setDisplay] as const;
};

const BUILT_IN = {
  list: { fallback: 'List', icon: IconList },
  table: { fallback: 'Table', icon: IconTable },
  board: { fallback: 'Board', icon: IconLayoutKanban },
} as const;

/**
 * The Display menu in a list's filter bar: table, board, list or its own.
 * It offers table or board, or the `displays` the list offers, such as
 * `['list', 'board', 'table']`, or the list's own (`TListDisplayOption`) among them:
 * `[{ key: 'cards', label, icon }, 'table']`. `useListDisplay(list, displays)` reads the choice.
 * `variant="switch"` shows the displays as buttons that stay in sight, for a page with two.
 */
export const DisplayMenu = <const K extends string = never>({
  list,
  displays = TABLE_AND_BOARD,
  variant = 'menu',
}: {
  list: string;
  displays?: ListDisplays<K>;
  variant?: 'menu' | 'switch';
}) => {
  const [current, setDisplay] = useListDisplay(list, displays);
  const { t } = useTranslation('views', { keyPrefix: 'display' });

  const options = displays.map((display) =>
    typeof display === 'string'
      ? {
          value: display,
          label: t(display, BUILT_IN[display].fallback),
          icon: BUILT_IN[display].icon,
        }
      : { value: display.key, label: display.label, icon: display.icon },
  );

  if (variant === 'switch')
    return (
      <ToggleGroup
        variant="outline"
        size="icon"
        aria-label={t('view', 'View')}
        value={[current]}
        onValueChange={([next]) => {
          if (next) setDisplay(next);
        }}
      >
        {options.map(({ value, label, icon: DisplayIcon }) => (
          <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}>
            <DisplayIcon />
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    );

  return (
    <Popover>
      <IconTip label={t('label', 'Display')}>
        <Popover.Trigger
          render={
            <Button variant="ghost" size="icon" aria-label={t('label', 'Display')} tone="muted" />
          }
        >
          <IconAdjustmentsHorizontal className="size-4" />
        </Popover.Trigger>
      </IconTip>
      <Popover.Content align="end" className={displays.length > 2 ? 'w-80' : 'w-64'}>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t('view', 'View')}</p>
        <div className={cn('grid gap-2', displays.length > 2 ? 'grid-cols-3' : 'grid-cols-2')}>
          {options.map(({ value, label, icon: DisplayIcon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={current === value}
              onClick={() => setDisplay(value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm text-muted-foreground transition-colors hover:bg-accent',
                current === value && 'border-primary bg-primary/5 font-medium text-foreground',
              )}
            >
              <DisplayIcon className="size-5" />
              <span className="text-center">{label}</span>
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
