import { Badge, cn } from 'erxes-ui';
import { useMessenger } from '../hooks/useMessenger';
import { IHeaderItem } from '../types';

interface HeaderItemProps {
  readonly title: string;
  readonly Icon: IHeaderItem['Icon'];
  readonly value: IHeaderItem['value'];
  readonly disabled: boolean;
}

export function HeaderItem({ title, Icon, value, disabled }: HeaderItemProps) {
  const { switchToTab } = useMessenger();

  return (
    <Badge
      variant="info"
      aria-disabled={disabled}
      onClick={() => !disabled && switchToTab(value)}
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
