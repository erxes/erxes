import { Sheet, Spinner } from 'erxes-ui';
import type { ComponentType, ReactNode } from 'react';

/**
 * A record opened beside its list (old core-ui side panel): header with
 * avatar, name and actions, then sections of fields edited in place.
 */
export const DetailPanel = ({
  open,
  onClose,
  loading,
  error,
  avatar,
  title,
  subtitle,
  actions,
  children,
}: {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) => (
  <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
    <Sheet.View
      className="flex w-full flex-col p-0 sm:max-w-xl"
      onInteractOutside={(event) => {
        // Inline editors open popovers outside the panel; keep the panel open.
        if ((event.target as HTMLElement | null)?.closest('[data-radix-popper-content-wrapper]')) {
          event.preventDefault();
        }
      }}
    >
      <Sheet.Header className="gap-3">
        {avatar}
        <div className="grid min-w-0 flex-1 leading-tight">
          <Sheet.Title className="truncate text-base">{title}</Sheet.Title>
          <Sheet.Description className="truncate text-sm text-muted-foreground">{subtitle ?? ''}</Sheet.Description>
        </div>
        {actions}
        <Sheet.Close />
      </Sheet.Header>
      <div className="styled-scroll min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-destructive">{error}</p>
        ) : (
          children
        )}
      </div>
    </Sheet.View>
  </Sheet>
);

export const DetailSection = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="border-b px-5 py-4 last:border-b-0">
    <header className="mb-2 flex h-6 items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {action}
    </header>
    <div className="flex flex-col gap-px">{children}</div>
  </section>
);

/** A label and its in-place editor. */
export const DetailRow = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
}) => (
  <div className="grid min-h-8 grid-cols-[150px_minmax(0,1fr)] items-center gap-2">
    <span className="flex items-center gap-2 truncate text-sm text-muted-foreground">
      {Icon && <Icon className="size-4 shrink-0" />}
      {label}
    </span>
    <div className="min-w-0 overflow-hidden rounded-sm [&_button]:rounded-sm">{children}</div>
  </div>
);
