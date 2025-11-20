import { useAtom } from 'jotai';
import { useMessenger } from '../hooks/useMessenger';
import { IHeaderItem } from '../types';
import { Button, Tooltip } from 'erxes-ui';
import { connectionAtom } from '../states';

export function HeaderTabItem({ Icon, value, disabled, title }: IHeaderItem) {
  const { activeTab, switchToTab } = useMessenger();
  const [connection] = useAtom(connectionAtom);
  const { ticketConfig } = connection?.widgetsMessengerConnect;

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="tab"
          size="icon"
          tabIndex={0}
          aria-selected={activeTab === value}
          className="flex items-center gap-2 bg-none hover:bg-transparent size-8 rounded-sm p-2 text-accent-foreground aria-selected:text-muted-foreground disabled:text-foreground"
          onClick={() => switchToTab(value as any)}
          disabled={disabled || (activeTab !== 'tickets' && !ticketConfig)}
        >
          <Icon size={16} />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="left">{title}</Tooltip.Content>
    </Tooltip>
  );
}
