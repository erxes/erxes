import { IconAdjustmentsHorizontal, IconLayoutKanban, IconTable } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../../components/button';
import { IconTip } from '../../components/icon-tip';
import { Popover } from '../../components/popover';
import { storedFamily } from '../../lib/stored';
import { cn } from '../../lib/utils';

const LIST_DISPLAYS = ['table', 'board'] as const;

/** How a list shows its records: rows in a table, or cards on a board. */
export type TListDisplay = (typeof LIST_DISPLAYS)[number];

const listDisplayFamily = storedFamily<TListDisplay>({
  key: 'erxes:list-display',
  schema: z.enum(LIST_DISPLAYS),
  initial: 'table',
});

/**
 * `const [display] = useListDisplay('sales-deals')`: the table or board a list shows, chosen
 * under its Display menu and remembered in this browser, one choice per list.
 */
export const useListDisplay = (list: string) => useAtom(listDisplayFamily(list));

const DISPLAYS = [
  { value: 'table', label: 'table', fallback: 'Table', icon: IconTable },
  { value: 'board', label: 'board', fallback: 'Board', icon: IconLayoutKanban },
] as const;

/** "Display" in a list's filter bar: table or board (`useListDisplay(list)` reads the choice). */
export const DisplayMenu = ({ list }: { list: string }) => {
  const [current, setDisplay] = useListDisplay(list);
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
        <div className="grid grid-cols-2 gap-2">
          {DISPLAYS.map(({ value, label, fallback, icon: Icon }) => (
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
              {t(label, fallback)}
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
