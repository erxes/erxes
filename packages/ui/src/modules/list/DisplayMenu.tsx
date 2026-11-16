import {
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
import { storedFamily } from '../../lib/stored';
import { cn } from '../../lib/utils';

const LIST_DISPLAYS = ['list', 'table', 'board'] as const;

/**
 * How a list shows its records: grouped rows, a table or a board.
 * Grouped rows are `RecordList`; a board shows cards.
 */
export type TListDisplay = (typeof LIST_DISPLAYS)[number];

/** The displays a list offers, in the menu's order; the first shows until one is chosen. */
type ListDisplays = readonly [TListDisplay, ...TListDisplay[]];

const TABLE_AND_BOARD: ListDisplays = ['table', 'board'];

/** Null until the member picks one. */
const listDisplayFamily = storedFamily<TListDisplay | null>({
  key: 'erxes:list-display',
  schema: z.enum(LIST_DISPLAYS).nullable(),
  initial: null,
});

/**
 * The display a list shows, as picked in its Display menu.
 * `const [display] = useListDisplay('sales-deals')`. The choice is remembered in this browser,
 * one per list. Give it the same `displays` as the list's `DisplayMenu`.
 */
export const useListDisplay = (list: string, displays: ListDisplays = TABLE_AND_BOARD) => {
  const [chosen, setDisplay] = useAtom(listDisplayFamily(list));
  const display = chosen && displays.includes(chosen) ? chosen : displays[0];

  return [display, setDisplay] as const;
};

const DISPLAYS = {
  list: { fallback: 'List', icon: IconList },
  table: { fallback: 'Table', icon: IconTable },
  board: { fallback: 'Board', icon: IconLayoutKanban },
} as const;

/**
 * The Display menu in a list's filter bar: table, board or grouped list.
 * It offers table or board, or the `displays` the list offers, such as
 * `['list', 'board', 'table']`; `useListDisplay(list, displays)` reads the choice.
 */
export const DisplayMenu = ({
  list,
  displays = TABLE_AND_BOARD,
}: {
  list: string;
  displays?: ListDisplays;
}) => {
  const [current, setDisplay] = useListDisplay(list, displays);
  const { t } = useTranslation('views', { keyPrefix: 'display' });

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
      <Popover.Content align="end" className="w-64">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t('view', 'View')}</p>
        <div className={cn('grid gap-2', displays.length > 2 ? 'grid-cols-3' : 'grid-cols-2')}>
          {displays.map((value) => {
            const { fallback, icon: Icon } = DISPLAYS[value];

            return (
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
                <Icon className="size-5" />
                {t(value, fallback)}
              </button>
            );
          })}
        </div>
      </Popover.Content>
    </Popover>
  );
};
