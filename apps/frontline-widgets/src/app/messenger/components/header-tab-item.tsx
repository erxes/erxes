import { useMessenger } from '../hooks/useMessenger';
import { IHeaderItem } from '../types';
import { Button, Tooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { unreadNotificationCountAtom } from '../states';

export function HeaderTabItem({ Icon, value, disabled, title }: IHeaderItem) {
  const { activeTab, switchToTab } = useMessenger();
  const unreadCount = useAtomValue(unreadNotificationCountAtom);

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            role="tab"
            size="icon"
            tabIndex={0}
            aria-selected={activeTab === value}
            className="relative flex items-center gap-2 bg-none hover:bg-transparent size-8 rounded-sm p-2 text-accent-foreground aria-selected:text-accent-foreground disabled:text-foreground"
            onClick={() => switchToTab(value as any)}
            disabled={disabled}
          >
            <Icon size={16} />
            {value === 'notifications' && unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">{title}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
}
