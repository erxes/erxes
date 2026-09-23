import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import type { IconName } from './Icon';

export const PageHeader = ({
  breadcrumbs,
  title,
  description,
  meta,
}: {
  breadcrumbs: Crumb[];
  icon?: IconName;
  title: string;
  description?: string;
  meta?: ReactNode;
}) => (
  <header className="border-b border-line pb-8">
    <Breadcrumbs items={breadcrumbs} />

    <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[36px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {meta ? <div className="shrink-0 pb-1">{meta}</div> : null}
    </div>
  </header>
);

export const CountBadge = ({
  count,
  label,
}: {
  count: number;
  label: string;
}) => (
  <span className="text-[13px]">
    <span className="font-semibold tabular-nums">{count}</span>{' '}
    <span className="opacity-70">{label}</span>
  </span>
);
