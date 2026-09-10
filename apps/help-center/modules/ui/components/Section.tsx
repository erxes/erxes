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
  <Reveal as="section" className={cn('scroll-mt-24', className)}>
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {icon ? (
            <Icon name={icon} size={17} className="shrink-0 text-brand" />
          ) : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>

    <div className="mt-6">{children}</div>
  </Reveal>
);
