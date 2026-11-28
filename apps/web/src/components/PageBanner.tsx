import { IconAlertTriangle, IconLock } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { PropsWithChildren } from 'react';

/** A banner's links: after its message, never wrapping it. */
export const BANNER_LINK = 'shrink-0 font-medium underline underline-offset-2';

/**
 * One line above every page about what the workspace may do: red when something has stopped
 * (`severe`), amber when it soon will. Its links come after the message.
 */
export const PageBanner = ({
  severe,
  message,
  children,
}: PropsWithChildren<{ severe: boolean; message: string }>) => (
  <output
    className={cn(
      'flex shrink-0 items-center gap-2 px-4 py-1.5 text-sm',
      severe ? 'bg-destructive/10 text-destructive-text' : 'bg-warning/10 text-warning-text',
    )}
  >
    {severe ? (
      <IconLock className="size-4 shrink-0" />
    ) : (
      <IconAlertTriangle className="size-4 shrink-0" />
    )}
    <span className="min-w-0 flex-1 truncate">{message}</span>
    {children}
  </output>
);
