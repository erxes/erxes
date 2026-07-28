import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { IconPin, IconPinFilled } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NavigationActivityPinButton = ({
  activity,
  className,
  pinned,
  onPinnedChange,
}: {
  activity: INavigationActivity;
  className?: string;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const label = t(pinned ? 'unpin-activity' : 'pin-activity', {
    name: activity.label,
  });

  return (
    <Button
      aria-label={label}
      className={cn(
        'size-7 shrink-0 transition-colors',
        pinned
          ? 'text-primary hover:bg-primary/10 hover:text-primary'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onPinnedChange(!pinned);
      }}
      size="icon"
      type="button"
      variant="ghost"
    >
      {pinned ? (
        <IconPinFilled className="size-4" />
      ) : (
        <IconPin className="size-4" />
      )}
    </Button>
  );
};
