import { IconAdjustmentsHorizontal, IconLayoutKanban, IconTable } from '@tabler/icons-react';
import { Button, cn, Popover } from 'erxes-ui';
import { useLeadView } from './leadView';
import { useLeadsT } from './i18n';

const VIEWS = [
  { value: 'table', label: 'table-view', icon: IconTable },
  { value: 'board', label: 'board-view', icon: IconLayoutKanban },
] as const;

/** "Display" in the leads filter bar (as old erxes): table or board, remembered in this browser. */
export const LeadDisplayMenu = () => {
  const [current, setView] = useLeadView();
  const t = useLeadsT();

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1.5 text-muted-foreground">
          <IconAdjustmentsHorizontal className="size-4" />
          {t('display')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-64 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{t('view')}</p>
        <div className="grid grid-cols-2 gap-2">
          {VIEWS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm text-muted-foreground transition-colors hover:bg-accent',
                current === value && 'border-primary bg-primary/5 font-medium text-foreground',
              )}
            >
              <Icon className="size-5" />
              {t(label)}
            </button>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
};
