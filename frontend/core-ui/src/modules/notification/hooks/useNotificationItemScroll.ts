import type {
  UseNotificationItemScrollOptions,
  UseNotificationItemScrollResult,
} from '@/notification/types/myInbox';
import { useEffect, useRef } from 'react';

export const useNotificationItemScroll = ({
  isActive,
  selectionFocused,
}: UseNotificationItemScrollOptions): UseNotificationItemScrollResult => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const previousFocus = useRef({ isActive, selectionFocused });

  useEffect(() => {
    if (
      (isActive && !previousFocus.current.isActive) ||
      (selectionFocused && !previousFocus.current.selectionFocused)
    ) {
      linkRef.current?.scrollIntoView({ block: 'nearest' });
    }
    previousFocus.current = { isActive, selectionFocused };
  }, [isActive, selectionFocused]);

  return linkRef;
};
