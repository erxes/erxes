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
  <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-subtle/60 px-6 py-14 text-center">
    <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-white text-muted shadow-sm">
      <Icon name={icon} size={22} />
    </span>
    <p className="text-base font-semibold text-ink">{title}</p>
    <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);
