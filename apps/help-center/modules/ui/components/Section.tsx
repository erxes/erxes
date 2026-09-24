import type { ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

export const Section = ({
  icon,
  title,
  description,
  action,
  className,
  children,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <Reveal as="section" className={cn('group/section scroll-mt-24', className)}>
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.02em] text-ink">
          {icon ? (
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand ring-4 ring-brand-soft/40 transition-[background-color,color,transform,box-shadow] duration-500 ease-out-soft group-hover/section:-rotate-6 group-hover/section:bg-brand group-hover/section:text-white group-hover/section:ring-brand/12"
            >
              <Icon name={icon} size={16} />
            </span>
          ) : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>

    <div className="mt-6">{children}</div>
  </Reveal>
);
