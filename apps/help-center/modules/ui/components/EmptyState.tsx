import type { ReactNode } from 'react';
import type { IconName } from './Icon';
import { IconOrb } from './IconOrb';

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
  <div className="flex flex-col gap-4 rounded-2xl bg-white px-5 py-6 shadow-shell sm:flex-row sm:items-center sm:gap-5">
    <IconOrb name={icon} size="sm" />
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
    {action ? <div className="shrink-0 sm:ml-2">{action}</div> : null}
  </div>
);
