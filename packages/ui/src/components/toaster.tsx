import { type ReactElement, useRef, useSyncExternalStore } from 'react';
import { Toast } from '@base-ui/react/toast';
import {
  IconAlertCircleFilled,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconInfoCircleFilled,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { type ToastData, toastManager } from '../hooks/use-toast';

const icons: Partial<Record<string, ReactElement>> = {
  success: <IconCircleCheckFilled className="text-success" />,
  warning: <IconAlertCircleFilled className="text-warning" />,
  destructive: <IconCircleXFilled className="text-destructive" />,
};

const ToastList = () => {
  const { t } = useTranslation();
  const { toasts } = Toast.useToastManager<ToastData>();

  return toasts.map((item) => (
    <Toast.Root
      key={item.id}
      toast={item}
      swipeDirection="right"
      className="group pointer-events-auto relative flex w-full items-center space-x-2 overflow-hidden rounded-md p-4 pr-6 shadow-lg transition-transform bg-background text-foreground translate-x-(--toast-swipe-movement-x) animate-in slide-in-from-top-full sm:slide-in-from-bottom-full data-limited:hidden data-swiping:transition-none data-ending-style:animate-out data-ending-style:fade-out-80 data-ending-style:slide-out-to-right-full"
    >
      <div className="[&>svg]:size-4.5 mt-0.5 flex-none mb-auto">
        {icons[item.type ?? ''] ?? <IconInfoCircleFilled className="text-info" />}
      </div>
      <div className="grid gap-1">
        <Toast.Title className="text-sm font-semibold [&+div]:text-xs" />
        <Toast.Description className="text-sm opacity-90" />
      </div>
      {item.data?.action}
      <Toast.Close
        aria-label={t('close', 'Close')}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-1 group-hover:opacity-100"
      >
        <IconX className="h-4 w-4" />
      </Toast.Close>
    </Toast.Root>
  ));
};

/**
 * How far up from the window's bottom the toasts start: above the highest save bar on screen
 * that their column crosses (`data-save-bar`: a form's save bar, a panel's, sheet's or
 * dialog's footer), so a toast never covers Save or Cancel.
 */
const saveBarClearance = (column: HTMLElement | null) => {
  if (!column) return 0;

  const { left, right } = column.getBoundingClientRect();

  const tops = Array.from(document.querySelectorAll('[data-save-bar]'), (bar) =>
    bar.getBoundingClientRect(),
  )
    .filter(
      (bar) =>
        bar.height > 0 &&
        bar.bottom > 0 &&
        bar.top < window.innerHeight &&
        bar.right > left &&
        bar.left < right,
    )
    .map((bar) => bar.top);

  return tops.length ? Math.max(0, window.innerHeight - Math.min(...tops)) : 0;
};

/** Save bars move when the page scrolls or the window resizes. */
const subscribeToLayout = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, true);
  window.addEventListener('resize', onChange);

  return () => {
    window.removeEventListener('scroll', onChange, true);
    window.removeEventListener('resize', onChange);
  };
};

/** The toasts' column, bottom right on wide screens and top on narrow ones. */
const ToastViewport = () => {
  const { t } = useTranslation('ui', { keyPrefix: 'toast' });
  // Read again whenever a toast comes or goes, so a save bar shown since counts.
  Toast.useToastManager();

  const columnRef = useRef<HTMLDivElement>(null);

  const clearance = useSyncExternalStore(
    subscribeToLayout,
    () => saveBarClearance(columnRef.current),
    () => 0,
  );

  const cssVariables: Record<`--${string}`, string> = { '--save-bar-clearance': `${clearance}px` };

  return (
    <Toast.Viewport
      ref={columnRef}
      aria-label={t('region', 'Notifications')}
      style={cssVariables}
      className="pointer-events-none fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-(--save-bar-clearance) sm:right-0 sm:top-auto sm:flex-col md:max-w-105"
    >
      <ToastList />
    </Toast.Viewport>
  );
};

/**
 * Draws the toasts `toast()` raises; core's web app already mounts it.
 * One toast at a time, bottom right on wide screens, above any save bar, and top on narrow ones.
 */
export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} limit={1}>
      <Toast.Portal>
        <ToastViewport />
      </Toast.Portal>
    </Toast.Provider>
  );
}
