import { useMessenger } from '../hooks/useMessenger';
import { IHeaderItem } from '../types';
import { Button } from 'erxes-ui';

export function HeaderTabItem({ Icon, value, disabled }: IHeaderItem) {
  const { activeTab, switchToTab } = useMessenger();

  return (
    <Button
      type="button"
      variant="ghost"
      role="tab"
      size="icon"
      tabIndex={0}
      aria-selected={activeTab === value}
      className="flex items-center gap-2 bg-none hover:bg-transparent size-8 rounded-sm p-2 text-accent-foreground aria-selected:text-muted-foreground disabled:text-foreground"
      onClick={() => switchToTab(value as any)}
      disabled={disabled}
    >
      <Icon size={16} />
    </Button>
  );
}
