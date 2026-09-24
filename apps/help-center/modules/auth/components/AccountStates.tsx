import { Icon } from '@/modules/ui/components/Icon';
import { AccountCover, accountColumns, accountShell } from './AccountAside';

const Bar = ({ className }: { className: string }) => (
  <span className={`block animate-pulse rounded bg-subtle ${className}`} />
);

const FieldSkeleton = () => (
  <div className="space-y-2">
    <Bar className="h-3.5 w-24" />
    <Bar className="h-11 w-full rounded-xl" />
  </div>
);

export const AccountPanelSkeleton = () => (
  <div className={accountColumns}>
    <div className={accountShell}>
      <AccountCover />
      <div className="-mt-12 space-y-3 px-6 pb-6">
        <span className="mx-auto block size-22 animate-pulse rounded-full bg-subtle ring-[3px] ring-white" />
        <Bar className="mx-auto h-4 w-36" />
        <Bar className="mx-auto h-3.5 w-44" />
      </div>
    </div>

    <div className={accountShell}>
      <div className="border-b border-line px-6 py-5">
        <Bar className="h-5 w-32" />
      </div>
      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
    </div>
  </div>
);

export const AccountLoadError = ({ message }: { message?: string }) => (
  <div className="rounded-2xl bg-white p-6 shadow-shell">
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
    >
      <Icon name="alert" size={15} className="mt-px shrink-0" />
      {message
        ? `Your details could not be loaded: ${message}`
        : 'Your details could not be loaded. Sign in again and try once more.'}
    </p>
  </div>
);
