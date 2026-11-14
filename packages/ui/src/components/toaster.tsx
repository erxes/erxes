import type { ReactElement } from 'react';
import { Toast } from '@base-ui/react/toast';
import {
  IconAlertCircleFilled,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconInfoCircleFilled,
  IconX,
} from '@tabler/icons-react';

import { type ToastData, toastManager } from '../hooks/use-toast';

const icons: Partial<Record<string, ReactElement>> = {
  success: <IconCircleCheckFilled className="text-success" />,
  warning: <IconAlertCircleFilled className="text-warning" />,
  destructive: <IconCircleXFilled className="text-destructive" />,
};

const ToastList = () => {
  const { toasts } = Toast.useToastManager<ToastData>();

  return toasts.map((item) => (
    <Toast.Root
      key={item.id}
      toast={item}
      swipeDirection="right"
      className="group pointer-events-auto relative flex w-full items-center space-x-2 overflow-hidden rounded-md p-4 pr-6 shadow-lg transition-all bg-background text-foreground translate-x-(--toast-swipe-movement-x) animate-in slide-in-from-top-full sm:slide-in-from-bottom-full data-limited:hidden data-swiping:transition-none data-ending-style:animate-out data-ending-style:fade-out-80 data-ending-style:slide-out-to-right-full"
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
        aria-label="Close"
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-1 group-hover:opacity-100"
      >
        <IconX className="h-4 w-4" />
      </Toast.Close>
    </Toast.Root>
  ));
};

/** One toast at a time, bottom right on wide screens and top on narrow ones. */
export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} limit={1}>
      <Toast.Portal>
        <Toast.Viewport className="pointer-events-none fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
