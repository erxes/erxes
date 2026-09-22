import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export const EmptyState = ({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 rounded-xl border border-dashed border-line bg-subtle/50 px-5 py-6 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-muted-foreground shadow-card">
      <Icon name={icon} size={19} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
    {action ? <div className="shrink-0 sm:ml-2">{action}</div> : null}
  </div>
);
