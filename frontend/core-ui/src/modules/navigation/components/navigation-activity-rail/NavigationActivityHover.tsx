import { NavigationActivityButton } from '@/navigation/components/navigation-activity-rail/NavigationActivityButton';
import { NavigationActivityPeek } from '@/navigation/components/navigation-activity-rail/NavigationActivityPeek';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { HoverCard } from 'erxes-ui';
import { useCallback, useEffect, useRef } from 'react';

const HOVER_PREVIEW_HANDOFF_DELAY = 60;

export const NavigationActivityHover = ({
  activity,
  active,
  expanded,
  open,
  pinned,
  onClose,
  onOpen,
  onPinnedChange,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  expanded: boolean;
  open: boolean;
  pinned: boolean;
  onClose: () => void;
  onOpen: () => void;
  onPinnedChange: (pinned: boolean) => void;
  onSelect: () => void;
}>) => {
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  }, []);

  const keepOpen = useCallback(() => {
    clearCloseTimeout();
    onOpen();
  }, [clearCloseTimeout, onOpen]);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeout.current = setTimeout(() => {
      onClose();
      closeTimeout.current = null;
    }, HOVER_PREVIEW_HANDOFF_DELAY);
  }, [clearCloseTimeout, onClose]);

  const closeImmediately = useCallback(() => {
    clearCloseTimeout();
    onClose();
  }, [clearCloseTimeout, onClose]);

  useEffect(() => clearCloseTimeout, [clearCloseTimeout]);

  const handleSelect = () => {
    clearCloseTimeout();
    onClose();
    onSelect();
  };

  return (
    <HoverCard
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          keepOpen();
        }
      }}
      openDelay={0}
      closeDelay={0}
    >
      <HoverCard.Trigger asChild>
        <div
          className="flex w-full shrink-0"
          onBlur={scheduleClose}
          onFocus={keepOpen}
          onPointerEnter={keepOpen}
          onPointerLeave={scheduleClose}
        >
          <NavigationActivityButton
            activity={activity}
            active={active}
            expanded={expanded}
            pinned={pinned}
            onPinnedChange={onPinnedChange}
            onSelect={handleSelect}
          />
        </div>
      </HoverCard.Trigger>
      <NavigationActivityPeek
        activity={activity}
        keepOpen={keepOpen}
        pinned={pinned}
        onPointerEnter={keepOpen}
        onPointerLeave={closeImmediately}
        onPinnedChange={onPinnedChange}
        scheduleClose={scheduleClose}
      />
    </HoverCard>
  );
};
