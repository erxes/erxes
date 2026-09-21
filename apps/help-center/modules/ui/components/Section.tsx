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
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {icon ? (
            <Icon
              name={icon}
              size={16}
              className="shrink-0 text-muted-foreground"
            />
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

    <div className="mt-5">{children}</div>
  </Reveal>
);
