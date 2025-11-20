import { useMessenger } from '../hooks/useMessenger';
import { IHeaderItem } from '../types';
import { Badge } from 'erxes-ui';
import { cn } from 'erxes-ui';
import { useAtom } from 'jotai';
import { connectionAtom } from '../states';

export function HeaderItem({ title, Icon, value, disabled }: IHeaderItem) {
  const { activeTab, switchToTab } = useMessenger();
  const [connection] = useAtom(connectionAtom);
  const { ticketConfig } = connection?.widgetsMessengerConnect;

  const isDisabled = disabled || (activeTab !== 'tickets' && !ticketConfig);

  return (
    <Badge
      variant="info"
      aria-disabled={isDisabled}
      onClick={() => !isDisabled && switchToTab(value)}
      className={cn(
        'px-2 flex items-center gap-2 cursor-pointer rounded-sm bg-muted border-none text-accent-foreground',
        disabled && 'cursor-default',
      )}
    >
      <Icon size={16} className="my-1.5" />
      <div className="text-xs leading-none font-semibold">{title}</div>
    </Badge>
  );
}
